import MainLayout from "@/components/layout/MainLayout";

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout showSidebar>{children}</MainLayout>;
}
