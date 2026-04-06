
import MainLayout from "@/components/layout/MainLayout";

 

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <MainLayout showSidebar={true}>
        {children}
        </MainLayout>
  );
}

//노드 = 가지 
// 레이아웃이 없으면 공통 레이아웃을 쓰는데, 레이아웃이 있으면 그 레이아웃을 참조한다 