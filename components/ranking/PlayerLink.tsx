import Link from "next/link";

interface PlayerLinkProps {
  playerUuid: string;
  playerName: string;
  avatarSize?: number;
  className?: string;
}

export function PlayerLink({
  playerUuid,
  playerName,
  avatarSize = 24,
  className = "",
}: PlayerLinkProps) {
  const avatarUrl = `https://vzge.me/face/256/${playerUuid}`;

  return (
    <Link
      href={`/ranking/player?uuid=${encodeURIComponent(playerUuid)}`}
      className={`inline-flex items-center gap-1.5 no-underline text-inherit hover:text-blue-600 transition-colors ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={avatarUrl}
        alt=""
        width={avatarSize}
        height={avatarSize}
        className="rounded [image-rendering:pixelated]"
        onError={(e) => {
          (e.target as HTMLImageElement).style.visibility = "hidden";
        }}
      />
      <span className="font-medium truncate">{playerName}</span>
    </Link>
  );
}
