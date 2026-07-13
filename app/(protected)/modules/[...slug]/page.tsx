import { findNavEntry } from "@/lib/navigation";
import UnderDevelopment from "@/components/UnderDevelopment";
import PatientRegistrationForm from "@/components/PatientRegistrationForm";
import PatientSearchForm from "@/components/PatientSearchForm";
import DuplicateManagementForm from "@/components/DuplicateManagementForm";
import NationalIdVerificationForm from "@/components/NationalIdVerificationForm";
import DemographicsContactsForm from "@/components/DemographicsContactsForm";
import ConsentDocumentsForm from "@/components/ConsentDocumentsForm";
import PatientTimelineForm from "@/components/PatientTimelineForm";
import AppointmentSchedulingForm from "@/components/AppointmentSchedulingForm";
import SlotCalendarManagementBoard from "@/components/SlotCalendarManagementBoard";
import QueueManagementBoard from "@/components/QueueManagementBoard";
import TokenDisplayBoard from "@/components/TokenDisplayBoard";
import CheckInCheckOutForm from "@/components/CheckInCheckOutForm";
import NoShowReschedulingForm from "@/components/NoShowReschedulingForm";
import ReferralManagementForm from "@/components/ReferralManagementForm";
import OPDRegistrationForm from "@/components/OPDRegistrationForm";
import TriageVitalsForm from "@/components/TriageVitalsForm";
import ConsultationForm from "@/components/ConsultationForm";
import ClinicalNotesForm from "@/components/ClinicalNotesForm";
import PrescriptionForm from "@/components/PrescriptionForm";
import InvestigationOrdersForm from "@/components/InvestigationOrdersForm";
import FollowUpSchedulingForm from "@/components/FollowUpSchedulingForm";
// import LabTestOrdersForm from "@/components/LabTestOrdersForm";
// import SampleCollectionForm from "@/components/SampleCollectionForm";
// import SampleTrackingForm from "@/components/SampleTrackingForm";
// import ResultEntryForm from "@/components/ResultEntryForm";
// import ResultValidationForm from "@/components/ResultValidationForm";
// import AnalyzerInterfaceForm from "@/components/AnalyzerInterfaceForm";
// import PathologyForm from "@/components/PathologyForm";
// import QualityControlForm from "@/components/QualityControlForm";
// import TestCatalogForm from "@/components/TestCatalogForm";

// Module/child slug pairs that have a real built page instead of the "Under Development" placeholder.
const BUILT_PAGES: Record<string, () => JSX.Element> = {
  "patient-management/patient-registration": PatientRegistrationForm,
  "patient-management/patient-search": PatientSearchForm,
  "patient-management/duplicate-management": DuplicateManagementForm,
  "patient-management/national-id-verification": NationalIdVerificationForm,
  "patient-management/demographics-contacts": DemographicsContactsForm,
  "patient-management/consent-documents": ConsentDocumentsForm,
  "patient-management/patient-timeline": PatientTimelineForm,
  "appointments-queue/appointment-scheduling": AppointmentSchedulingForm,
  "appointments-queue/slot-calendar-management": SlotCalendarManagementBoard,
  "appointments-queue/queue-management": QueueManagementBoard,
  "appointments-queue/token-display-board": TokenDisplayBoard,
  "appointments-queue/check-in-check-out": CheckInCheckOutForm,
  "appointments-queue/no-show-rescheduling": NoShowReschedulingForm,
  "appointments-queue/referral-management": ReferralManagementForm,
  "opd-management/opd-registration": OPDRegistrationForm,
  "opd-management/triage-vitals": TriageVitalsForm,
  "opd-management/consultation": ConsultationForm,
  "opd-management/clinical-notes-emr": ClinicalNotesForm,
  "opd-management/prescriptions": PrescriptionForm,
  "opd-management/investigation-orders": InvestigationOrdersForm,
  "opd-management/follow-up-scheduling": FollowUpSchedulingForm,
  // "laboratory-lis/test-orders": LabTestOrdersForm,
  // "laboratory-lis/sample-collection": SampleCollectionForm,
  // "laboratory-lis/sample-tracking": SampleTrackingForm,
  // "laboratory-lis/result-entry": ResultEntryForm,
  // "laboratory-lis/result-validation": ResultValidationForm,
  // "laboratory-lis/analyzer-interface": AnalyzerInterfaceForm,
  // "laboratory-lis/pathology": PathologyForm,
  // "laboratory-lis/quality-control": QualityControlForm,
  // "laboratory-lis/test-catalog": TestCatalogForm,
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function ModulePage({
  params,
}: {
  params: { slug: string[] };
}) {
  // Brief artificial delay so the health-pulse loading state is actually visible on navigation.
  await delay(500);

  const [moduleSlug, childSlug] = params.slug ?? [];
  const key = moduleSlug && childSlug ? `${moduleSlug}/${childSlug}` : "";
  const BuiltPage = BUILT_PAGES[key];

  if (BuiltPage) {
    return <BuiltPage />;
  }

  const entry = moduleSlug && childSlug ? findNavEntry(moduleSlug, childSlug) : null;

  return <UnderDevelopment entry={entry} fallbackSlug={params.slug ?? []} />;
}
