import MainLayout from "@/components/layout/MainLayout";
import LocationDetail from "@/components/staff/locationDashboard/location/locationDetail";

export default async function LocationDetailPage({ params }: { params: Promise<{ locationid: string }> }) {
  const { locationid } = await params;

  return (
    <MainLayout showSidebar={false}>
      <LocationDetail deptId={locationid} />
    </MainLayout>
  );
}
