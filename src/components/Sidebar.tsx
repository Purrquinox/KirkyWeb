"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, ExploreIcon, BellIcon, BookmarkIcon, UserIcon } from "./Icons";
import FAB from "./FAB";

const NAV = [
  { href: "/home",              icon: HomeIcon,     label: "Home"          },
  { href: "/explore",           icon: ExploreIcon,  label: "Explore"       },
  { href: "/notifications",     icon: BellIcon,     label: "Notifications" },
  { href: "/bookmarks",         icon: BookmarkIcon, label: "Bookmarks"     },
];

interface SidebarProps {
  username?: string;
  onCompose?: () => void;
}

export default function Sidebar({ username, onCompose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 64,
        height: "100dvh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px 0 24px",
        borderRight: "1px solid var(--div)",
        flexShrink: 0,
        gap: 0,
      }}
    >
      {/* Wordmark */}
      <Link
        href="/home"
        style={{ textDecoration: "none", marginBottom: 20 }}
        aria-label="Kirky home"
      >
        <span
          style={{
            fontWeight: 900,
            fontSize: 20,
            letterSpacing: "-0.8px",
            color: "var(--t-hi)",
            userSelect: "none",
            lineHeight: 1,
          }}
        >
          k
        </span>
      </Link>

      {/* Nav items */}
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          flex: 1,
        }}
      >
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              title={label}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                borderRadius: 12,
                color: active ? "var(--t-hi)" : "var(--t-lo)",
                textDecoration: "none",
                transition: `color ${160}ms var(--ease-out), background ${160}ms var(--ease-out)`,
                background: active ? "var(--bg-surface)" : "transparent",
              }}
            >
              <Icon size={22} />
              {active && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 4,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 20,
                    height: 3,
                    borderRadius: 999,
                    background: "linear-gradient(90deg, var(--accent-a), var(--accent-b))",
                  }}
                />
              )}
            </Link>
          );
        })}

        {username && (
          <Link
            href={`/${username}`}
            aria-label="Profile"
            title="Profile"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: 12,
              color: pathname === `/${username}` ? "var(--t-hi)" : "var(--t-lo)",
              textDecoration: "none",
              transition: `color ${160}ms var(--ease-out)`,
            }}
          >
            <UserIcon size={22} />
          </Link>
        )}
      </nav>

      {/* Compose FAB */}
      <FAB onClick={onCompose} />
    </aside>
  );
}
