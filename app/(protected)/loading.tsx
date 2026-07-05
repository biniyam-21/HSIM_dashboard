import HealthPulseLoader from "@/components/HealthPulseLoader";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <HealthPulseLoader label="Loading module" />
    </div>
  );
}
