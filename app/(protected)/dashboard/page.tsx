import ContentHeader from "@/components/ContentHeader";
import MainGrid from "@/components/MainGrid";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function DashboardPage() {
  // Brief artificial delay so the health-pulse loading state is actually visible on navigation.
  await delay(500);
  return (
    <>
      <ContentHeader />
      <MainGrid />
    </>
  );
}
