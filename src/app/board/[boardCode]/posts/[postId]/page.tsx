import BoardPostDetailPageClient from "@/components/board/BoardPostDetailPageClient";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    boardCode: string;
    postId: string;
  }>;
};

export default async function BoardPostDetailPage({ params }: Props) {
  const { boardCode, postId } = await params;
  return <BoardPostDetailPageClient boardCode={boardCode} postId={postId} />;
}
