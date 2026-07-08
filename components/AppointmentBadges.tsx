import {
  APPOINTMENT_STATUS_STYLES,
  QUEUE_STATUS_STYLES,
  PRIORITY_STYLES,
  type AppointmentStatus,
  type QueueStatus,
  type Priority,
} from "@/lib/appointmentsQueueData";

/** Pill badge for appointment lifecycle status (Scheduled, Confirmed, Checked In, ...). */
export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${APPOINTMENT_STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

/** Pill badge for live queue ticket status (Waiting, Called, Serving, ...). */
export function QueueBadge({ status }: { status: QueueStatus }) {
  return (
    <span
      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${QUEUE_STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

/** Pill badge for patient/appointment priority (Routine, Urgent, Emergency, VIP, High Risk). */
export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${PRIORITY_STYLES[priority]}`}
    >
      {priority}
    </span>
  );
}
