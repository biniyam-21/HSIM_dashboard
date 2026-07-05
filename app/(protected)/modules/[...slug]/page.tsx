import { findNavEntry } from "@/lib/navigation";
import UnderDevelopment from "@/components/UnderDevelopment";

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
  const entry = moduleSlug && childSlug ? findNavEntry(moduleSlug, childSlug) : null;

  return <UnderDevelopment entry={entry} fallbackSlug={params.slug ?? []} />;
}
