import MainLayout from "@/components/layout/MainLayout";
import LocationUpdate from "@/components/staff/locationDashboard/location/locationUpdate";

export default async function LocationEditPage({ params }: { params: Promise<{ locationid: string }> }) {
  const { locationid } = await params;

  return (
    <MainLayout showSidebar={false}>
      <LocationUpdate deptId={locationid} />
    </MainLayout>
  );
}
