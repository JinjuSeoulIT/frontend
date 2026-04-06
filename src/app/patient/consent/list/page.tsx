import MainLayout from "@/components/layout/MainLayout";
import PatientSelectList from "@/components/patient/PatientSelectList";

export default function ConsentsPage() {
  return (
    <MainLayout>
      <PatientSelectList
        title="동의서 관리"
        description="환자를 선택하면 동의서 관리 화면으로 이동합니다."
        basePath="/patient"
        pathSuffix="/consent"
      />
    </MainLayout>
  );
}
