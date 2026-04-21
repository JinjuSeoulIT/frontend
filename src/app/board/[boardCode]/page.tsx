import BoardPageClient from "@/components/board/BoardPageClient";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    boardCode: string;
  }>;
};

export default async function BoardCodePage({ params }: Props) {
  const { boardCode } = await params;
  return <BoardPageClient boardCode={boardCode} />;
}
