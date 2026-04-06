import MainLayout from "@/components/layout/MainLayout";
import LocationDelete from "@/components/staff/locationDashboard/location/locationDelete";

export default async function LocationDeletePage({ params }: { params: Promise<{ locationid: string }> }) {
  const { locationid } = await params;

  return (
    <MainLayout showSidebar={false}>
      <LocationDelete deptId={locationid} />
    </MainLayout>
  );
}
