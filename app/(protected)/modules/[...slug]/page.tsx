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
