import MainLayout from "@/components/layout/MainLayout";
import LocationList from "@/components/staff/locationDashboard/location/locationList";

export default function Page() {
  return (
    <MainLayout showSidebar={false}>
      <LocationList />
    </MainLayout>
  );
}
