import MainLayout from "@/components/layout/MainLayout";
import FeaturePlaceholder from "@/components/layout/FeaturePlaceholder";

export default function MedicalListPage() {
  return (
    <MainLayout showSidebar={false}>
      <FeaturePlaceholder
        title="진료과 마스터 목록 준비 중"
        description="기존 진료과 마스터 목록 화면은 현재 정리 중입니다. 우선 의사 목록에서 관련 작업을 이어가 주세요."
        primaryHref="/staff/doctor/list"
        primaryLabel="의사 목록으로"
        secondaryHref="/staff/members"
        secondaryLabel="직원 목록으로"
      />
    </MainLayout>
  );
}
