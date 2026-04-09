import MainLayout from "@/components/layout/MainLayout";
import FeaturePlaceholder from "@/components/layout/FeaturePlaceholder";

export default function MedicalCreatePage() {
  return (
    <MainLayout showSidebar={false}>
      <FeaturePlaceholder
        title="진료과 마스터 등록 준비 중"
        description="기존 진료과 마스터 등록 화면은 현재 정리 중입니다. 우선 의사 목록이나 스태프 화면을 이용해 주세요."
        primaryHref="/staff/doctor/list"
        primaryLabel="의사 목록으로"
        secondaryHref="/staff/members"
        secondaryLabel="직원 목록으로"
      />
    </MainLayout>
  );
}
