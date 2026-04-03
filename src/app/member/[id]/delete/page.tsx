type PageProps = {
  params: { id: string };
};

import MemberDelete from "@/components/member/MemberDelete";

export default function DeletePage({ params }: PageProps) {
  const userId = Number(params.id);
  return <MemberDelete userId={userId} />;
}