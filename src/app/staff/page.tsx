import StaffListClient from "@/app/staff/list/StaffListClient";
import type {
  StaffDepartmentSummaryItem,
  StaffLocationSummaryItem,
  StaffSummaryItem,
} from "@/lib/staff/staffSummaryApi";

export const dynamic = "force-dynamic";

export default function StaffPage() {
  const initialRows: StaffSummaryItem[] = [];
  const initialDepartments: StaffDepartmentSummaryItem[] = [];
  const initialLocations: StaffLocationSummaryItem[] = [];
  const initialError: string | null = null;

  return (
    <StaffListClient
      initialRows={initialRows}
      initialDepartments={initialDepartments}
      initialLocations={initialLocations}
      initialError={initialError}
    />
  );
}
