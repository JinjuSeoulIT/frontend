import MainLayout from "@/components/layout/MainLayout";
import PatientSelectList from "@/components/patient/PatientSelectList";

export default function InsurancesPage() {
  return (
    <MainLayout>
      <PatientSelectList
        title="보험 관리"
        description="환자를 선택하면 보험 관리 화면으로 이동합니다."
        basePath="/patient"
        pathSuffix="/insurance"
      />
    </MainLayout>
  );
}
