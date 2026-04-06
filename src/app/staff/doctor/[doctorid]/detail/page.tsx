import DoctorDetail from "@/components/staff/doctorDashboard/doctor/DoctorDetail";
import MainLayout from "@/components/layout/MainLayout";
import { notFound } from "next/navigation";

export default async function DetailPage({ params }: { params: Promise<{ doctorid: string }> }) {
  const { doctorid } = await params;

  // ✅ URL 파라미터는 항상 string으로 들어오므로 숫자로 한 번 고정
  const staffId = Number(doctorid);

  // ✅ 숫자가 아니면 /undefined 같은 잘못된 주소이므로 바로 차단
  if (!Number.isFinite(staffId)) {
    notFound();
  }

  return (
    <MainLayout showSidebar={false}>
      <DoctorDetail staffId={staffId} />
    </MainLayout>
  );
}
