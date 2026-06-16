"use client";

interface UserAvatarProps {
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  size?: number;
  isOwn?: boolean;
}

const PALETTE = [
  "#7C3AED", "#2563EB", "#0891B2", "#059669",
  "#D97706", "#DC2626", "#DB2777", "#7C3AED",
];

function hashUsername(username: string): number {
  let h = 0;
  for (let i = 0; i < username.length; i++) {
    h = (Math.imul(31, h) + username.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function getInitials(username: string, firstName?: string | null, lastName?: string | null): string {
  if (firstName && lastName) return (firstName[0] + lastName[0]).toUpperCase();
  if (firstName) return firstName[0].toUpperCase();
  return username.slice(0, 2).toUpperCase();
}

export default function UserAvatar({
  username,
  firstName,
  lastName,
  avatar,
  size = 36,
  isOwn = false,
}: UserAvatarProps) {
  const initials = getInitials(username, firstName, lastName);
  const bgColor  = PALETTE[hashUsername(username) % PALETTE.length];
  const fontSize = Math.round(size * 0.38);

  const ringStyle: React.CSSProperties = isOwn
    ? { boxShadow: `0 0 0 2.5px var(--accent-a)` }
    : { boxShadow: `0 0 0 1.5px rgba(255,255,255,0.10)` };

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
        ...ringStyle,
      }}
    >
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatar}
          alt={`${username}'s avatar`}
          width={size}
          height={size}
          style={{ width: size, height: size, objectFit: "cover", display: "block" }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            background: bgColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize,
            fontWeight: 900,
            color: "rgba(255,255,255,0.92)",
            letterSpacing: "-0.02em",
          }}
          aria-label={`${username}'s avatar`}
        >
          {initials}
        </div>
      )}
    </div>
  );
}
