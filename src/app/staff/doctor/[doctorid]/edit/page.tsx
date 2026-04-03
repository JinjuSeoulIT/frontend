import DoctorUpdate from "@/components/staff/doctorDashboard/doctor/doctorUpdate";
import MainLayout from "@/components/layout/MainLayout";
import { notFound } from "next/navigation";

export default async function EditPage({ params }: { params: Promise<{ doctorid: string }> }) {
  const { doctorid } = await params;

  // ✅ edit도 동일하게 숫자로 바꿔서 넘김
  const staffId = Number(doctorid);

  if (!Number.isFinite(staffId)) {
    notFound();
  }

  return (
    <MainLayout showSidebar={false}>
      <DoctorUpdate staffId={staffId} />
    </MainLayout>
  );
}
