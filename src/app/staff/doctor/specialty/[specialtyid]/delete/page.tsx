import MainLayout from "@/components/layout/MainLayout";
import FeaturePlaceholder from "@/components/layout/FeaturePlaceholder";

export default function SpecialtyDeletePage() {
  return (
    <MainLayout showSidebar={false}>
      <FeaturePlaceholder
        title="의사 전문과 배정 삭제 준비 중"
        description="기존 전문과 배정 삭제 화면은 현재 정리 중입니다. 우선 의사 목록으로 이동해 주세요."
        primaryHref="/staff/doctor/list"
        primaryLabel="의사 목록으로"
      />
    </MainLayout>
  );
}
