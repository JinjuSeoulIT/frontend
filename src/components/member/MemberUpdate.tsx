type MemberUpdateProps = {
  userId: number;
};

export default function MemberUpdate({ userId }: MemberUpdateProps) {
  return <div>Member update page for user #{userId}</div>;
}
