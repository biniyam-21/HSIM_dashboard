# Patient Management — Backend Requirements & Stack

> **Module:** Patient Management
> **Document type:** Backend API Design, Data Models, Business Logic, Infrastructure
> **Covers:** All 7 sub-modules under Patient Management
> **Compliance context:** Ethiopian Ministry of Health (MOH), Fayda National ID System, CBHI Insurance

---

## Table of Contents

1. [Recommended Tech Stack](#1-recommended-tech-stack)
2. [Deployment Architecture](#2-deployment-architecture)
3. [Shared Infrastructure & Cross-Cutting Concerns](#3-shared-infrastructure--cross-cutting-concerns)
4. [Patient Registration — Backend](#4-patient-registration--backend)
5. [Patient Search — Backend](#5-patient-search--backend)
6. [Duplicate Management — Backend](#6-duplicate-management--backend)
7. [National ID Verification — Backend](#7-national-id-verification--backend)
8. [Demographics & Contacts — Backend](#8-demographics--contacts--backend)
9. [Consent & Documents — Backend](#9-consent--documents--backend)
10. [Patient Timeline — Backend](#10-patient-timeline--backend)
11. [Database Schema Overview](#11-database-schema-overview)
12. [API Conventions](#12-api-conventions)

---

## 1. Recommended Tech Stack

### Core Backend

| Layer | Recommended | Reason |
|---|---|---|
| **Runtime** | Node.js 20 LTS | Non-blocking I/O suits concurrent patient lookups; huge ecosystem; same language as frontend |
| **Framework** | NestJS (TypeScript) | Opinionated structure, decorators-based, built-in DI, guards, interceptors — scales to enterprise HMS size |
| **API style** | REST + WebSocket | REST for CRUD operations; WebSocket (Socket.IO) for real-time timeline updates and notifications |
| **ORM** | Prisma | Type-safe, auto-generates client from schema, excellent migration tooling, supports PostgreSQL |
| **Primary DB** | PostgreSQL 16 | ACID-compliant, strong relational integrity, JSONB for flexible metadata, full-text search built-in |
| **Search Engine** | Elasticsearch 8 | Powers fuzzy name search, wildcard queries, phonetic matching for Patient Search and Duplicate Detection |
| **Cache** | Redis 7 | Session cache, rate limiting, search result caching, real-time pub/sub |
| **File Storage** | MinIO (self-hosted S3-compatible) | Stores patient photos, scanned ID documents, consent PDFs; on-premises for MOH data residency |
| **Message Queue** | BullMQ (Redis-backed) | Async jobs: duplicate detection, Fayda ID verification, document OCR, notification dispatch |
| **Auth** | JWT + Refresh Tokens | Stateless auth; refresh tokens stored in Redis; RBAC via NestJS Guards |

### Supporting Services

| Service | Tool | Purpose |
|---|---|---|
| **API Gateway** | Nginx | Reverse proxy, SSL termination, rate limiting at edge |
| **Containerization** | Docker + Docker Compose | Consistent environments across dev/staging/prod |
| **Orchestration** | Kubernetes (K8s) | Production horizontal scaling, health checks, rolling deploys |
| **CI/CD** | GitHub Actions | Automated test, lint, build, and deploy pipelines |
| **Monitoring** | Prometheus + Grafana | API latency, error rates, queue depths |
| **Logging** | Winston → ELK Stack (Elasticsearch, Logstash, Kibana) | Centralized audit logs, compliance reporting |
| **Secret Management** | HashiCorp Vault / AWS Secrets Manager | DB credentials, Fayda API keys, JWT secrets |

### External Integrations

| Integration | Protocol | Notes |
|---|---|---|
| **Fayda National ID System** | REST/HTTPS | Ethiopian government identity API; requires MOH-issued API key |
| **CBHI/Insurance APIs** | REST/HTTPS | Eligibility verification; varies by payer |
| **SMS Gateway** | Africa's Talking / Twilio | OTP delivery, consent request notifications |
| **Email** | SendGrid / AWS SES | Document sharing, consent signature requests |

---

## 2. Deployment Architecture

```
Internet
    │
    ▼
[Nginx — API Gateway / SSL]
    │
    ├──► [NestJS API Cluster]  ◄──► [Redis Cache + BullMQ]
    │         │
    │         ├──► [PostgreSQL Primary]
    │         │         └──► [PostgreSQL Read Replica]
    │         │
    │         ├──► [Elasticsearch Cluster]
    │         │
    │         └──► [MinIO Object Storage]
    │
    ├──► [Background Workers]  (BullMQ consumers)
    │         ├── Duplicate Detection Worker
    │         ├── Fayda Verification Worker
    │         ├── Document OCR Worker
    │         └── Notification Worker
    │
    └──► [WebSocket Server]  (Socket.IO via Redis adapter)
```

### Environment Tiers

| Tier | Infrastructure | Notes |
|---|---|---|
| **Development** | Docker Compose (local) | All services in containers, hot reload |
| **Staging** | Single K8s cluster (2 nodes) | Mirrors production, uses anonymized data |
| **Production** | K8s cluster (3+ nodes, multi-AZ) | Auto-scaling, daily DB backups, WAL archiving |

---

## 3. Shared Infrastructure & Cross-Cutting Concerns

### 3.1 Authentication & Authorization

Every API request must carry a valid `Authorization: Bearer <JWT>` header.

**JWT Payload:**
```json
{
  "sub": "staff-uuid",
  "role": "RECEPTIONIST | NURSE | DOCTOR | ADMIN",
  "facilityId": "facility-uuid",
  "departmentId": "department-uuid",
  "iat": 1716400000,
  "exp": 1716403600
}
```

**RBAC Matrix for Patient Management:**

| Action | RECEPTIONIST | NURSE | DOCTOR | ADMIN |
|---|---|---|---|---|
| Register patient | Yes | Yes | Yes | Yes |
| Search patients | Yes | Yes | Yes | Yes |
| Edit demographics | Yes | Yes | Yes | Yes |
| Verify National ID | Yes | Yes | Yes | Yes |
| Manage consents | Yes | Yes | Yes | Yes |
| Merge duplicates | No | No | No | Yes |
| Delete patient record | No | No | No | Yes |
| View audit logs | No | No | Yes | Yes |

### 3.2 Audit Logging

Every write operation on a patient record must produce an audit entry:

```
AuditLog {
  id, entityType, entityId, action (CREATE|UPDATE|DELETE|VIEW_SENSITIVE),
  changedFields (JSON diff), performedBy (staffId), facilityId,
  ipAddress, userAgent, timestamp
}
```

Audit logs are immutable — no UPDATE or DELETE allowed on them. Written to a separate `audit_logs` table and also streamed to Elasticsearch for compliance reporting.

### 3.3 Soft Delete

Patient records are never hard-deleted. A `deletedAt` timestamp and `deletedBy` field mark them as deleted. All queries filter `WHERE deleted_at IS NULL` by default. Admins can restore deleted records.

### 3.4 Data Encryption

- **At rest:** PostgreSQL column-level encryption for National ID numbers, phone numbers, and insurance IDs using `pgcrypto`.
- **In transit:** TLS 1.3 enforced on all connections.
- **File storage:** MinIO server-side encryption (SSE-S3) for all patient documents and photos.

### 3.5 Rate Limiting

Applied at the Nginx layer and reinforced in NestJS using Redis:

| Endpoint group | Limit |
|---|---|
| General patient API | 200 req/min per user |
| National ID Verification | 20 req/min per user |
| Patient Search | 60 req/min per user |
| File upload | 10 req/min per user |

---

## 4. Patient Registration — Backend

### 4.1 Overview

Creates a new patient master record (Person Master Index — PMI). This is the foundational record that all other HMS modules reference. A unique MRN is issued at creation.

### 4.2 API Endpoints

```
POST   /api/v1/patients                   → Create patient (full registration)
POST   /api/v1/patients/draft             → Save registration as draft
GET    /api/v1/patients/mrn/generate      → Generate next available MRN
GET    /api/v1/patients/:id               → Get patient by internal UUID
PUT    /api/v1/patients/:id               → Update patient record
DELETE /api/v1/patients/:id               → Soft delete
```

### 4.3 Request Body — Create Patient

```json
{
  "firstName": "Selamawit",
  "middleName": "Abebe",
  "lastName": "Desta",
  "gender": "FEMALE",
  "dateOfBirth": "1992-12-05",
  "nationality": "Ethiopian",
  "religion": "Orthodox",
  "maritalStatus": "MARRIED",
  "occupation": "Teacher",
  "preferredLanguage": "Amharic",
  "bloodGroup": "O_POSITIVE",
  "faydaNationalId": "1001-2345-6789",
  "identification": {
    "idType": "ETHIOPIAN_NATIONAL_ID",
    "idNumber": "1234567890123",
    "issueDate": "2018-01-01",
    "expiryDate": "2028-01-01"
  },
  "initialVisit": {
    "visitType": "OPD",
    "visitDate": "2026-05-22",
    "departmentId": "dept-uuid",
    "referredFromFacilityId": null,
    "notes": "..."
  },
  "photo": "base64string | null"
}
```

### 4.4 MRN Generation Logic

```
MRN format: MRN-{YEAR}-{6-digit-padded-sequence}
Example:    MRN-2026-000123

Steps:
1. Acquire a Redis distributed lock (key: "mrn:lock:{facilityId}")
2. Fetch last sequence number from DB: SELECT MAX(mrn_sequence) FROM patients WHERE facility_id = ?
3. Increment by 1
4. Format: MRN-{currentYear}-{padStart(6, '0')}
5. Insert patient record with this MRN
6. Release lock

Concurrency: The distributed lock prevents two simultaneous registrations
from getting the same MRN. Lock TTL = 5 seconds.
```

### 4.5 Business Logic & Validation

**Step-by-step server-side flow:**

1. **Input validation** — Validate all required fields (name, gender, DOB, nationality, visit type, visit date, department). Return `400 Bad Request` with field-level errors on failure.

2. **Age calculation** — Compute age from `dateOfBirth`. Reject if DOB is in the future. Flag if age < 0 or > 150.

3. **Duplicate pre-check** — Before creating the record, run a quick duplicate check:
   - Exact match on `(firstName + lastName + dateOfBirth + gender)` → block and return `409 Conflict` with suspected duplicate IDs.
   - If staff explicitly passes `{ "overrideDuplicateCheck": true }`, allow creation and flag the record for manual review.

4. **Fayda ID inline verification** — If `faydaNationalId` is provided:
   - Call the Fayda verification service (see section 7).
   - Store verification reference on the patient record.
   - If verification fails, still allow registration but mark `faydaVerified: false`.

5. **MRN generation** — Generate unique MRN as described above.

6. **Photo upload** — If photo is provided as base64:
   - Decode and validate MIME type (accept: `image/jpeg`, `image/png`).
   - Resize to 400×400 px using Sharp.
   - Upload to MinIO at path: `patients/{patientId}/photo.jpg`.
   - Store MinIO object URL on patient record.

7. **Initial visit record creation** — Create a linked `Visit` record in the visits table with the provided visit details.

8. **Audit log** — Write `CREATE` audit entry.

9. **Search index** — Push patient data to Elasticsearch index asynchronously via BullMQ job.

10. **Response** — Return `201 Created` with the full patient record including generated MRN.

### 4.6 Draft Handling

Drafts are stored in a separate `patient_drafts` table with a TTL of 7 days. Draft IDs are returned to the client and can be resumed. Drafts do not get an MRN until finalized.

### 4.7 Error Codes

| Code | Scenario |
|---|---|
| 400 | Validation failure (missing required fields, invalid DOB) |
| 409 | Duplicate patient detected (returns `suspectedDuplicates` array) |
| 422 | Business rule violation (e.g. future DOB) |
| 500 | MRN generation lock failure (retry after 2s) |

---

## 5. Patient Search — Backend

### 5.1 Overview

Provides a multi-field, fuzzy-capable patient search backed by Elasticsearch for fast and flexible lookups. Results are paginated, sortable, and exportable. The primary database is not hit for search queries — all reads go to the Elasticsearch index.

### 5.2 API Endpoints

```
GET    /api/v1/patients/search             → Full search with filters
GET    /api/v1/patients/search/quick       → Quick single-field lookup (typeahead)
POST   /api/v1/patients/search/saved       → Save a search filter set
GET    /api/v1/patients/search/saved       → List user's saved searches
DELETE /api/v1/patients/search/saved/:id   → Delete saved search
GET    /api/v1/patients/search/export      → Export results as CSV/XLSX
```

### 5.3 Search Query Parameters

```
GET /api/v1/patients/search?
  searchBy=ALL               (ALL | NAME | MRN | PHONE | NATIONAL_ID)
  fullName=Selamawit
  mrn=MRN-2026-000123
  phone=0911234567
  nationalId=1001-2345-6789
  dateOfBirth=1992-12-05
  gender=FEMALE
  bloodGroup=O_POSITIVE
  departmentId=dept-uuid
  visitDateFrom=2026-01-01
  visitDateTo=2026-05-22
  includeInactive=false
  page=1
  pageSize=10
  sortBy=LAST_VISIT          (LAST_VISIT | NAME | MRN)
  sortOrder=DESC
```

### 5.4 Search Logic — Step by Step

**Step 1: Query construction**
The NestJS service builds an Elasticsearch `bool` query:
- `must` clauses for exact fields (MRN, National ID, phone).
- `should` clauses with `fuzzy` queries for name fields (handles typos, partial names).
- `filter` clauses for gender, blood group, department, date ranges.
- `wildcard` support: if input contains `*`, it becomes an ES wildcard query.

**Step 2: Phonetic matching for names**
The Elasticsearch index uses the `phonetic` analyzer (Beider-Morse or Soundex) on name fields. This handles cases like "Selamawit" vs "Selemawit" or Amharic transliteration variations.

**Step 3: Active/inactive filter**
By default, `status = ACTIVE` filter is applied. When `includeInactive=true`, the filter is removed.

**Step 4: Pagination**
Elasticsearch `from` / `size` pagination. Maximum `pageSize` = 100. Total count returned for frontend pagination rendering.

**Step 5: Result hydration**
Elasticsearch stores a projection of patient data (name, MRN, DOB, gender, phone, blood group, last visit, status). Full patient details are fetched from PostgreSQL only when opening a specific record — not during search.

**Step 6: Cache layer**
Results for identical query parameter sets are cached in Redis with TTL = 30 seconds. Cache is invalidated when any patient record in the result set is updated.

### 5.5 Export Logic

- Export is triggered as a background BullMQ job.
- Generates CSV or XLSX from PostgreSQL (not Elasticsearch) for data accuracy.
- File is uploaded to MinIO with a signed 10-minute download URL returned to the client.
- Maximum export size: 10,000 records per export.

### 5.6 Saved Searches

Saved searches store the entire query parameter set as JSONB in the `saved_searches` table, linked to the staff member's ID. Loaded on demand and re-submitted to the search endpoint.

---

## 6. Duplicate Management — Backend

### 6.1 Overview

Detects, surfaces, and resolves duplicate patient records. Duplication can happen from multi-department registrations, typos, or manual re-registrations. The system uses probabilistic matching, not just exact matching.

### 6.2 API Endpoints

```
GET    /api/v1/patients/duplicates              → List all pending duplicate pairs
GET    /api/v1/patients/duplicates/:id          → Get a specific duplicate pair detail
POST   /api/v1/patients/duplicates/detect       → Manually trigger detection for a patient
PUT    /api/v1/patients/duplicates/:id/merge    → Merge secondary into primary
PUT    /api/v1/patients/duplicates/:id/dismiss  → Mark as "Not a Duplicate"
GET    /api/v1/patients/duplicates/history      → Merged/dismissed history log
```

### 6.3 Duplicate Detection Algorithm

**Probabilistic scoring (Fellegi-Sunter model):**

Each pair of records is scored across multiple fields. Score ranges from 0.0 to 1.0.

| Field | Match type | Weight |
|---|---|---|
| First Name | Fuzzy (Levenshtein ≤ 2) | 0.20 |
| Last Name | Fuzzy (Levenshtein ≤ 2) | 0.20 |
| Date of Birth | Exact | 0.25 |
| Gender | Exact | 0.10 |
| Phone Number | Exact (normalized) | 0.15 |
| National ID | Exact | 0.30 (bonus) |
| Mother's Name | Fuzzy | 0.10 |

**Thresholds:**
- Score ≥ 0.85 → Auto-flagged as HIGH confidence duplicate
- Score 0.60–0.84 → Flagged as POSSIBLE duplicate, requires manual review
- Score < 0.60 → Not a duplicate

### 6.4 Detection Trigger Points

- **On registration:** Every new patient registration triggers a background BullMQ job that compares the new record against all existing records in the same facility using the scoring algorithm.
- **Batch detection:** A nightly scheduled job runs full-facility duplicate detection using a blocking queue (processes up to 10,000 records/hour).
- **Manual trigger:** Staff can manually trigger detection for a specific patient via the API.

### 6.5 Merge Logic — Step by Step

Merging is a critical, irreversible operation (soft-irreversible — records are archived, not deleted).

1. **Authorization check** — Only ADMIN role can perform merges.
2. **Lock both records** — Acquire Redis locks on `patient:{primaryId}` and `patient:{secondaryId}` to prevent concurrent edits during merge.
3. **Identify primary record** — Staff selects which record is the "truth" (primary). The other becomes the secondary (source).
4. **Field-by-field merge** — For each field where records differ, the primary record's value is kept unless staff explicitly selects the secondary's value in the comparison UI.
5. **Reassign all linked records:**
   - All visits linked to `secondaryId` → relinked to `primaryId`
   - All lab results → relinked
   - All prescriptions → relinked
   - All consents and documents → relinked
   - All billing records → relinked
6. **Mark secondary as MERGED** — `status = MERGED`, `mergedIntoId = primaryId`, `mergedAt = now()`, `mergedBy = staffId`.
7. **Audit log** — Write a detailed `MERGE` audit entry listing all reassigned record counts.
8. **Update search index** — Remove secondary from Elasticsearch; update primary.
9. **Release locks.**
10. **Notify** — Send in-app notification to all staff who have recently accessed the secondary record.

### 6.6 Dismiss Logic

When staff confirms two records are NOT duplicates:
- Write a `duplicate_dismissals` entry with both patient IDs and the staff member who dismissed.
- Future duplicate detection jobs skip this pair permanently.

---

## 7. National ID Verification — Backend

### 7.1 Overview

Verifies a patient's identity against the Ethiopian Fayda National ID system in real time. Returns biographic data and an ID photo. All interactions are logged for MOH compliance.

### 7.2 API Endpoints

```
POST   /api/v1/patients/verify-national-id         → Verify ID and get biographic data
GET    /api/v1/patients/verify-national-id/recent  → Today's verification log (current staff)
GET    /api/v1/patients/:id/id-verifications        → Full verification history for a patient
```

### 7.3 Request / Response

**Request:**
```json
{
  "idType": "FAYDA_NATIONAL_ID",
  "idNumber": "1001-2345-6789",
  "consentConfirmed": true,
  "patientId": "uuid | null"
}
```

**Response (success):**
```json
{
  "referenceNumber": "NID-2026-05-22-1124-001",
  "status": "MATCHED",
  "verifiedBy": "Dr. Eyob Tesfaye",
  "verifiedAt": "2026-05-22T11:24:00Z",
  "biographicData": {
    "fullNameEnglish": "Selamawit Desta Abebe",
    "fullNameAmharic": "ሰላማዊት ደስታ አበበ",
    "gender": "FEMALE",
    "dateOfBirth": "1992-05-12",
    "nationality": "Ethiopian",
    "placeOfBirth": "Addis Ababa",
    "idIssueDate": "2018-01-01",
    "idExpiryDate": "2028-01-01",
    "idStatus": "ACTIVE"
  },
  "photoUrl": "signed-url-to-minio/...",
  "existingPatient": null
}
```

### 7.4 Verification Flow — Step by Step

1. **Validate request** — `idNumber` format validation (regex: `\d{4}-\d{4}-\d{4}`). `consentConfirmed` must be `true` — reject with `403` if false.

2. **Rate limit check** — Max 20 Fayda API calls per staff member per minute (Redis counter). Return `429` if exceeded.

3. **Cache check** — Check Redis for a cached result for this `idNumber` (TTL: 5 minutes). Fayda API charges per call; caching reduces cost and latency.

4. **Call Fayda API** — If not cached:
   ```
   POST https://api.fayda.gov.et/v1/verify
   Headers: { Authorization: Bearer {MOH_API_KEY}, X-Facility-ID: {facilityId} }
   Body: { nid: "1001-2345-6789" }
   Timeout: 8 seconds
   Retry: 2 retries with exponential backoff on 5xx responses
   ```

5. **Handle Fayda response:**
   - `200 MATCHED` → Proceed to step 6.
   - `200 NOT_FOUND` → Return status `NOT_FOUND` to client; patient can still register.
   - `200 EXPIRED` → Return status `EXPIRED`; alert staff that ID is no longer valid.
   - `4xx/5xx` → Log error, return `502 Bad Gateway` to client with a user-friendly message.

6. **Fetch ID photo** — Call Fayda photo endpoint separately. Download the image, store it in MinIO (`verification-photos/{referenceNumber}.jpg`), generate a signed URL with 1-hour expiry.

7. **Check for existing patient** — Search PostgreSQL for a patient with matching `faydaNationalId`. If found, return their basic info in `existingPatient` field so staff can link rather than re-register.

8. **Store verification record** — Write to `id_verifications` table:
   ```
   { id, patientId, idType, idNumber (encrypted), status, referenceNumber,
     verifiedBy, facilityId, consentConfirmed, biographicDataSnapshot (JSONB encrypted),
     createdAt }
   ```

9. **Cache result** — Store result in Redis (TTL: 5 minutes).

10. **Audit log** — Write `VERIFY_NATIONAL_ID` audit entry with reference number.

11. **Return response** to client.

### 7.5 Linking to Patient Record

After verification, staff can link the verified ID to an existing patient:
```
PUT /api/v1/patients/:id/link-national-id
Body: { verificationReferenceNumber: "NID-2026-05-22-1124-001" }
```
This updates the patient's `faydaNationalId`, `faydaVerified = true`, and stores the reference number.

---

## 8. Demographics & Contacts — Backend

### 8.1 Overview

Manages the complete demographic profile of an existing patient. This is a read-heavy, write-occasionally endpoint. All changes produce an audit diff. Multiple sub-sections (Demographics, Contact, Emergency Contacts, Family, Address, Additional) are managed via tabbed sub-resources.

### 8.2 API Endpoints

```
GET    /api/v1/patients/:id/demographics              → Full demographics profile
PUT    /api/v1/patients/:id/demographics              → Update demographics (personal info + additional)
PUT    /api/v1/patients/:id/contacts                  → Update contact information
PUT    /api/v1/patients/:id/emergency-contacts        → Update emergency contacts
PUT    /api/v1/patients/:id/family                    → Update family information
PUT    /api/v1/patients/:id/address                   → Update address
GET    /api/v1/patients/:id/data-quality              → Get data quality score
GET    /api/v1/patients/:id/audit-history             → View change history
POST   /api/v1/patients/:id/documents/upload          → Upload ID document
```

### 8.3 Data Quality Score — Calculation Logic

The data quality score (shown as a ring in the UI) is calculated server-side on every GET and after every update:

```
Required fields (each worth 1 point):
  Core (10 pts): firstName, lastName, gender, dateOfBirth, nationality,
                 mrn, phone, address, bloodGroup, emergencyContact
  Recommended (6 pts): photo, faydaNationalId, email, occupation,
                        maritalStatus, insuranceId
  Optional (4 pts): knownAllergies, chronicConditions, height/weight, secondaryPhone

Score = (filledFields / totalFields) * 100
Status:
  90-100% → Complete (emerald)
  70-89%  → Good (blue)
  50-69%  → Partial (amber)
  < 50%   → Incomplete (red)
```

### 8.4 Update Logic — Step by Step

1. **Fetch current record** from PostgreSQL.
2. **Compute diff** — Compare incoming fields with current values. Track `changedFields` as a JSON object: `{ fieldName: { from: oldValue, to: newValue } }`.
3. **Validate** — Re-run business rules: DOB not in future, phone format, email format, BMI range sanity check.
4. **BMI auto-calculation** — If height or weight is updated: `BMI = weight(kg) / (height(m))²`. Classify: Underweight (<18.5), Normal (18.5–24.9), Overweight (25–29.9), Obese (≥30).
5. **Write update** to PostgreSQL.
6. **Audit log** — Store diff in `AuditLog.changedFields`.
7. **Recalculate data quality score** and return updated score in response.
8. **Update Elasticsearch index** — Push updated fields (name, phone, DOB) to search index.

### 8.5 Contacts Sub-Resource Schema

```json
{
  "primaryPhone": "+251911234567",
  "secondaryPhone": null,
  "email": "selamawit@email.com",
  "emergencyContacts": [
    {
      "name": "Abebe Desta",
      "relationship": "SPOUSE",
      "phone": "+251911234568",
      "address": "Addis Ababa, Bole Sub-city"
    }
  ],
  "address": {
    "region": "Addis Ababa",
    "subCity": "Bole",
    "woreda": "03",
    "kebele": "05",
    "houseNumber": "A-12",
    "poBox": null
  }
}
```

---

## 9. Consent & Documents — Backend

### 9.1 Overview

Manages all consent records and patient documents. Consent records have a lifecycle (Draft → Pending Signature → Active → Expired / Revoked). Documents are stored in MinIO with metadata in PostgreSQL.

### 9.2 API Endpoints

**Consents:**
```
GET    /api/v1/patients/:id/consents                   → List all consents (with status filter)
POST   /api/v1/patients/:id/consents                   → Create new consent record
GET    /api/v1/patients/:id/consents/:consentId        → Get consent detail
PUT    /api/v1/patients/:id/consents/:consentId        → Update consent (sign, revoke, renew)
GET    /api/v1/patients/:id/consents/summary           → Consent summary stats
GET    /api/v1/patients/:id/consents/expiring-soon     → Consents expiring in next 30 days
POST   /api/v1/patients/:id/consents/:consentId/sign   → Record signature
POST   /api/v1/patients/:id/consents/:consentId/revoke → Revoke consent
POST   /api/v1/patients/:id/consents/request-signature → Send e-signature request (SMS/email)
```

**Documents:**
```
GET    /api/v1/patients/:id/documents                  → List all documents (by category)
POST   /api/v1/patients/:id/documents                  → Upload document (multipart/form-data)
GET    /api/v1/patients/:id/documents/:docId           → Get document metadata
GET    /api/v1/patients/:id/documents/:docId/download  → Download (signed URL)
DELETE /api/v1/patients/:id/documents/:docId           → Soft delete document
PUT    /api/v1/patients/:id/documents/:docId/share     → Share with department
```

### 9.3 Consent Lifecycle — Step by Step

```
CREATE (staff fills form)
  │
  ▼
DRAFT (saved but not yet sent)
  │
  ▼
PENDING_SIGNATURE (sent to patient via SMS/email)
  │
  ├──► ACTIVE (patient/doctor signs digitally or physically)
  │         │
  │         ├──► EXPIRED (validUntil date passes — automated by nightly job)
  │         │
  │         └──► REVOKED (patient withdraws consent — explicit action)
  │
  └──► CANCELLED (staff cancels before signing)
```

**Creating a consent:**
1. Validate consent type, linked encounter ID, required signatories.
2. Create consent record with `status = DRAFT`.
3. If `autoSend = true`, queue a BullMQ notification job immediately.
4. Return created consent with `id` and current status.

**Recording a signature:**
```json
POST /api/v1/patients/:id/consents/:consentId/sign
{
  "signedBy": "patient | doctor | witness",
  "signatureType": "DIGITAL | PHYSICAL",
  "signatureData": "base64-image | null",
  "signedAt": "2026-05-22T10:30:00Z"
}
```
- Append signature to `consent_signatures` table.
- If all required signatories have signed → set `status = ACTIVE`.
- Write audit log entry.

**Expiry automation:**
- A BullMQ cron job runs nightly at 00:01 local time.
- Query: `SELECT * FROM consents WHERE status = 'ACTIVE' AND valid_until < NOW()`.
- Bulk update to `EXPIRED`.
- Trigger in-app notifications for each affected patient's primary nurse/doctor.

**E-signature request flow:**
1. Generate a one-time signed URL: `https://hms.fiker.et/sign/:token` (token TTL: 72 hours).
2. Send via SMS (Africa's Talking) and/or email (SendGrid).
3. Patient opens link, reviews consent text, draws/types signature.
4. Submitted signature calls `POST /api/v1/consents/sign-public/:token` (no auth required — token IS the auth).
5. Signature recorded, token invalidated.

### 9.4 Document Upload Flow — Step by Step

1. **Accept multipart/form-data** with fields: `file`, `category`, `description`, `encounterId`.
2. **Validate:** Max file size = 25 MB. Allowed MIME types: `application/pdf`, `image/jpeg`, `image/png`, `image/tiff`.
3. **Virus scan** — Pass file buffer through ClamAV scanner. Reject if threat detected.
4. **Generate storage path:** `patients/{patientId}/documents/{category}/{uuid}.{ext}`.
5. **Upload to MinIO** with server-side encryption enabled.
6. **OCR job** (async) — For PDF/image documents, queue a background OCR job (Tesseract.js or AWS Textract) to extract searchable text stored in `document_content` column.
7. **Write metadata** to `patient_documents` table.
8. **Audit log** entry.
9. Return document metadata with a 15-minute signed download URL.

### 9.5 Document Categories

```
CLINICAL         → Discharge summaries, clinical notes, referral letters
IDENTITY         → National ID scans, passport copies
CERTIFICATE      → Medical certificates, birth certificates
LEGAL            → Court orders, medico-legal documents
INSURANCE        → Insurance cards, eligibility letters
REFERRAL         → External referral letters
OTHER            → Miscellaneous
```

---

## 10. Patient Timeline — Backend

### 10.1 Overview

Aggregates clinical events from all HMS modules into a unified chronological feed per patient. The timeline is read-only — it reflects data from the source modules. Events are fetched from multiple tables and unified via a fan-out query or a dedicated `timeline_events` materialized view.

### 10.2 API Endpoints

```
GET    /api/v1/patients/:id/timeline                    → Paginated timeline events
GET    /api/v1/patients/:id/timeline/summary            → Event counts by category
GET    /api/v1/patients/:id/timeline/vitals/latest      → Most recent vital signs
GET    /api/v1/patients/:id/timeline/conditions/chronic → Chronic conditions list
GET    /api/v1/patients/:id/timeline/export             → Export timeline as PDF
```

### 10.3 Timeline Query Parameters

```
GET /api/v1/patients/:id/timeline?
  category=ENCOUNTER | LAB | RADIOLOGY | MEDICATION | PROCEDURE |
           VITALS | DOCUMENT | REFERRAL | ADMISSION
  dateFrom=2025-05-22
  dateTo=2026-05-22
  search=headache
  page=1
  pageSize=20
  sortOrder=DESC
```

### 10.4 Data Aggregation Strategy

The timeline pulls from multiple tables. Two strategies are supported:

**Strategy A: Fan-out UNION query (for small-to-medium patient histories)**
```sql
SELECT 'ENCOUNTER' as category, id, patient_id, created_at as event_time,
       json_build_object(...) as payload FROM visits WHERE patient_id = ?
UNION ALL
SELECT 'LAB', id, patient_id, resulted_at, json_build_object(...) FROM lab_results WHERE patient_id = ?
UNION ALL
SELECT 'MEDICATION', id, patient_id, prescribed_at, json_build_object(...) FROM prescriptions WHERE patient_id = ?
UNION ALL
SELECT 'DOCUMENT', id, patient_id, uploaded_at, json_build_object(...) FROM patient_documents WHERE patient_id = ?
...
ORDER BY event_time DESC
LIMIT 20 OFFSET ?
```

**Strategy B: Materialized `timeline_events` table (for high-volume patients)**
For patients with >500 events, a dedicated `timeline_events` table is maintained. Each source module writes a timeline event record when it creates or updates a relevant record. This table is indexed on `(patient_id, event_time DESC, category)`.

```
TimelineEvent {
  id, patientId, category, eventTime, title,
  summary (text), sourceTable, sourceId,
  metadata (JSONB), createdAt
}
```

The backend auto-selects the strategy based on the patient's event count threshold.

### 10.5 Event Types and Source Mapping

| Category | Source Table | Trigger |
|---|---|---|
| ENCOUNTER | `visits` | New visit created |
| LAB | `lab_results` | Results available |
| RADIOLOGY | `imaging_reports` | Report signed off |
| MEDICATION | `prescriptions` | Prescription issued |
| PROCEDURE | `procedures` | Procedure completed |
| VITALS | `vital_signs` | Vitals recorded |
| DOCUMENT | `patient_documents` | Document uploaded |
| REFERRAL | `referrals` | Referral created |
| ADMISSION | `admissions` | IPD admission / discharge |
| CLINICAL_NOTE | `clinical_notes` | Note written |

### 10.6 Real-Time Updates via WebSocket

When a new event is added to any source table, the system broadcasts it to any connected clients viewing that patient's timeline:

```
// Server emits on channel: patient:{patientId}:timeline
{
  "event": "TIMELINE_NEW_EVENT",
  "data": {
    "category": "LAB",
    "title": "Lab Results Available",
    "eventTime": "2026-05-22T09:45:00Z",
    "summary": "CBC, Blood Glucose — Results Ready"
  }
}
```

**WebSocket auth:** Client sends JWT in the handshake query string. NestJS Gateway validates before allowing subscription.

### 10.7 Timeline Export — Step by Step

1. Staff clicks "Export" with optional date range and category filter.
2. Backend queues a `generate-timeline-pdf` BullMQ job.
3. Worker fetches all matching events (no pagination limit for export).
4. Generates PDF using Puppeteer (renders an HTML template populated with events).
5. PDF includes: patient header (name, MRN, DOB, blood group), events chronologically, facility logo and stamp.
6. Uploads PDF to MinIO.
7. Returns signed 30-minute download URL via webhook/polling.

---

## 11. Database Schema Overview

### Core Tables

```sql
-- Patient master record
CREATE TABLE patients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mrn             VARCHAR(20) UNIQUE NOT NULL,
  mrn_sequence    INTEGER NOT NULL,
  facility_id     UUID NOT NULL REFERENCES facilities(id),
  first_name      VARCHAR(100) NOT NULL,
  middle_name     VARCHAR(100),
  last_name       VARCHAR(100) NOT NULL,
  gender          VARCHAR(10) NOT NULL CHECK (gender IN ('MALE','FEMALE','OTHER')),
  date_of_birth   DATE NOT NULL,
  nationality     VARCHAR(50),
  blood_group     VARCHAR(10),
  fayda_national_id VARCHAR(20) ENCRYPTED,  -- pgcrypto encrypted
  fayda_verified  BOOLEAN DEFAULT FALSE,
  fayda_verified_at TIMESTAMPTZ,
  status          VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE','MERGED','DELETED')),
  merged_into_id  UUID REFERENCES patients(id),
  photo_url       TEXT,
  data_quality_score SMALLINT DEFAULT 0,
  created_by      UUID REFERENCES staff(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,
  deleted_by      UUID REFERENCES staff(id)
);

-- Patient demographics extension
CREATE TABLE patient_demographics (
  patient_id      UUID PRIMARY KEY REFERENCES patients(id),
  religion        VARCHAR(50),
  marital_status  VARCHAR(20),
  occupation      VARCHAR(100),
  education_level VARCHAR(50),
  ethnicity       VARCHAR(50),
  preferred_language VARCHAR(50),
  rh_factor       VARCHAR(15),
  height_cm       DECIMAL(5,1),
  weight_kg       DECIMAL(5,1),
  bmi             DECIMAL(4,1),
  bmi_status      VARCHAR(20),
  smoker          BOOLEAN DEFAULT FALSE,
  alcohol_use     VARCHAR(20),
  known_allergies TEXT,
  chronic_conditions TEXT[],
  special_needs   TEXT,
  physical_disability BOOLEAN DEFAULT FALSE,
  disability_details TEXT,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Patient identifications
CREATE TABLE patient_identifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(id),
  id_type         VARCHAR(50) NOT NULL,
  id_number       TEXT NOT NULL,  -- encrypted
  issue_date      DATE,
  expiry_date     DATE,
  document_url    TEXT,
  is_primary      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Patient contacts
CREATE TABLE patient_contacts (
  patient_id      UUID PRIMARY KEY REFERENCES patients(id),
  primary_phone   VARCHAR(20) NOT NULL,  -- encrypted
  secondary_phone VARCHAR(20),
  email           VARCHAR(150),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency contacts
CREATE TABLE emergency_contacts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(id),
  name            VARCHAR(150) NOT NULL,
  relationship    VARCHAR(50),
  phone           VARCHAR(20) NOT NULL,  -- encrypted
  address         TEXT,
  is_primary      BOOLEAN DEFAULT FALSE
);

-- Patient address
CREATE TABLE patient_addresses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(id),
  address_type    VARCHAR(20) DEFAULT 'HOME',
  region          VARCHAR(100),
  sub_city        VARCHAR(100),
  woreda          VARCHAR(50),
  kebele          VARCHAR(50),
  house_number    VARCHAR(50),
  po_box          VARCHAR(20),
  is_current      BOOLEAN DEFAULT TRUE
);

-- ID verifications (Fayda)
CREATE TABLE id_verifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID REFERENCES patients(id),
  id_type         VARCHAR(50) NOT NULL,
  id_number       TEXT NOT NULL,  -- encrypted
  status          VARCHAR(20) NOT NULL CHECK (status IN ('MATCHED','NOT_FOUND','EXPIRED','FAILED')),
  reference_number VARCHAR(50),
  verified_by     UUID REFERENCES staff(id),
  facility_id     UUID REFERENCES facilities(id),
  consent_confirmed BOOLEAN NOT NULL,
  biographic_data JSONB,  -- encrypted JSONB
  photo_url       TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Consents
CREATE TABLE patient_consents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(id),
  encounter_id    UUID REFERENCES visits(id),
  consent_type    VARCHAR(50) NOT NULL,
  purpose         TEXT,
  status          VARCHAR(30) DEFAULT 'DRAFT',
  valid_from      DATE,
  valid_until     DATE,
  template_id     UUID,
  created_by      UUID REFERENCES staff(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Consent signatures
CREATE TABLE consent_signatures (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consent_id      UUID NOT NULL REFERENCES patient_consents(id),
  signed_by_type  VARCHAR(20) CHECK (signed_by_type IN ('PATIENT','DOCTOR','WITNESS','GUARDIAN')),
  signed_by_id    UUID,  -- staff id or null for patient
  signed_by_name  VARCHAR(150),
  signature_type  VARCHAR(20) CHECK (signature_type IN ('DIGITAL','PHYSICAL')),
  signature_data  TEXT,  -- base64 image or null
  signed_at       TIMESTAMPTZ NOT NULL
);

-- Patient documents
CREATE TABLE patient_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(id),
  encounter_id    UUID REFERENCES visits(id),
  category        VARCHAR(50) NOT NULL,
  title           VARCHAR(200) NOT NULL,
  description     TEXT,
  mime_type       VARCHAR(100),
  file_size_bytes INTEGER,
  storage_path    TEXT NOT NULL,
  ocr_content     TEXT,
  shared_with     UUID[],  -- department IDs
  uploaded_by     UUID REFERENCES staff(id),
  uploaded_at     TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

-- Duplicate pairs
CREATE TABLE duplicate_pairs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id_a    UUID NOT NULL REFERENCES patients(id),
  patient_id_b    UUID NOT NULL REFERENCES patients(id),
  score           DECIMAL(4,3) NOT NULL,
  confidence      VARCHAR(10) CHECK (confidence IN ('HIGH','POSSIBLE')),
  status          VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING','MERGED','DISMISSED')),
  dismissed_by    UUID REFERENCES staff(id),
  dismissed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs
CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type     VARCHAR(50) NOT NULL,
  entity_id       UUID NOT NULL,
  action          VARCHAR(30) NOT NULL,
  changed_fields  JSONB,
  performed_by    UUID NOT NULL REFERENCES staff(id),
  facility_id     UUID REFERENCES facilities(id),
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
-- Audit logs are append-only: no UPDATE/DELETE allowed (enforce via PostgreSQL rule or trigger)
```

### Key Indexes

```sql
-- Patient search
CREATE INDEX idx_patients_mrn ON patients(mrn);
CREATE INDEX idx_patients_fayda_id ON patients(fayda_national_id);
CREATE INDEX idx_patients_facility_status ON patients(facility_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_patients_dob ON patients(date_of_birth);

-- Full-text search fallback (before Elasticsearch)
CREATE INDEX idx_patients_name_fts ON patients
  USING gin(to_tsvector('english', first_name || ' ' || last_name));

-- Duplicates
CREATE UNIQUE INDEX idx_duplicate_pairs_unique ON duplicate_pairs(
  LEAST(patient_id_a, patient_id_b), GREATEST(patient_id_a, patient_id_b)
);

-- Timeline
CREATE INDEX idx_timeline_events_patient_time ON timeline_events(patient_id, event_time DESC);
CREATE INDEX idx_timeline_events_category ON timeline_events(patient_id, category, event_time DESC);
```

---

## 12. API Conventions

### Base URL
```
https://api.hms.fiker.et/api/v1
```

### Standard Response Envelope

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 10,
    "total": 128,
    "totalPages": 13
  },
  "timestamp": "2026-05-22T11:24:00Z",
  "requestId": "req-uuid"
}
```

### Error Response Envelope

```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_PATIENT",
    "message": "A patient with similar details already exists.",
    "details": [
      { "field": "firstName", "message": "Required" }
    ],
    "suspectedDuplicates": ["patient-uuid-1", "patient-uuid-2"]
  },
  "timestamp": "2026-05-22T11:24:00Z",
  "requestId": "req-uuid"
}
```

### HTTP Status Code Usage

| Status | When |
|---|---|
| 200 | Successful GET, PUT |
| 201 | Successful POST (resource created) |
| 204 | Successful DELETE (no body) |
| 400 | Validation failure |
| 401 | Missing or invalid JWT |
| 403 | Authenticated but insufficient role |
| 404 | Resource not found |
| 409 | Conflict (duplicate patient, MRN collision) |
| 422 | Business rule violation |
| 429 | Rate limit exceeded |
| 502 | External API (Fayda) failure |
| 500 | Internal server error |

### Versioning

API versioned via URL path (`/api/v1/`). Breaking changes increment to `/api/v2/`. Both versions run concurrently during transition periods.

### Pagination

All list endpoints support cursor-based pagination for performance on large datasets:
```
GET /api/v1/patients/search?page=2&pageSize=25
```
For timeline and audit logs (append-only, high volume), cursor pagination is used:
```
GET /api/v1/patients/:id/timeline?cursor=event-uuid&direction=BEFORE&pageSize=20
```
