"use client";

import Link from "next/link";
import UserAvatar from "./UserAvatar";
import type { PrivateUser } from "@/lib/api";

interface TopBarProps {
  user?: PrivateUser | null;
  title?: string;
  left?: React.ReactNode;
}

export default function TopBar({ user, title, left }: TopBarProps) {
  const profile = user?.profile;

  return (
    <header
      style={{
        height: 52,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 16,
        paddingRight: 14,
        borderBottom: "1px solid var(--div)",
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "var(--bg-overlay)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {left}
        {title ? (
          <span
            style={{
              fontWeight: 900,
              fontSize: 17,
              letterSpacing: "-0.3px",
              color: "var(--t-hi)",
            }}
          >
            {title}
          </span>
        ) : (
          <Link href="/home" style={{ textDecoration: "none" }} aria-label="Kirky home">
            <span className="wordmark">kirky</span>
          </Link>
        )}
      </div>

      {user !== undefined && (
        <div>
          {profile ? (
            <Link href={`/${profile.username}`} style={{ lineHeight: 0 }}>
              <UserAvatar
                username={profile.username}
                firstName={profile.firstName}
                lastName={profile.lastName}
                avatar={profile.avatar}
                size={32}
                isOwn
              />
            </Link>
          ) : (
            <Link
              href="/login"
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--t-hi)",
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: 999,
                background: "linear-gradient(135deg, var(--accent-a), var(--accent-b))",
              }}
            >
              Sign in
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
