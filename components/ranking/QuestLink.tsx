import Link from "next/link";

interface QuestLinkProps {
  questId: string;
  questName: string;
  className?: string;
}

export function QuestLink({ questId, questName, className = "" }: QuestLinkProps) {
  return (
    <Link
      href={`/ranking/quest?id=${encodeURIComponent(questId)}`}
      className={`no-underline text-blue-600 hover:text-blue-800 hover:underline transition-colors ${className}`}
    >
      {questName}
    </Link>
  );
}
