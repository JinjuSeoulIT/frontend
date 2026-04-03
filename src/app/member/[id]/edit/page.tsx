import MemberUpdate from "@/components/member/MemberUpdate";

type PageProps = {
  params: { id: string };
};

export default function EditPage({ params }: PageProps) {
  const userId = Number(params.id);
  return <MemberUpdate userId={userId} />;
}