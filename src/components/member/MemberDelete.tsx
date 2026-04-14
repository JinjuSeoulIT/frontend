type MemberDeleteProps = {
  userId: number;
};

export default function MemberDelete({ userId }: MemberDeleteProps) {
  return <div>Member delete page for user #{userId}</div>;
}
