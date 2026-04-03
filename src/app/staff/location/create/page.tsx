import MainLayout from "@/components/layout/MainLayout";
import LocationCreate from "@/components/staff/locationDashboard/location/locationCreate";

export default function Page() {
  return (
    <MainLayout showSidebar={false}>
      <LocationCreate />
    </MainLayout>
  );
}
