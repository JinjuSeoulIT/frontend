"use client";

import MainLayout from "@/components/layout/MainLayout";
import LocationHub from "@/components/staff/locationDashboard/locationHub";

const LocationPage = () => {
  return (
    <MainLayout showSidebar={false}>
      <LocationHub />
    </MainLayout>
  );
};

export default LocationPage;
