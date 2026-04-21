import MainLayout from "@/components/layout/MainLayout";
import MemberCreate from "@/components/member/create/MemberCreate";

export default function StaffCreatePage() {
  return (
    <MainLayout showSidebar={true}>
      <MemberCreate />
    </MainLayout>
  );
}
