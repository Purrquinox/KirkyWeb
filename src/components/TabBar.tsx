"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, ExploreIcon, BellIcon, BookmarkIcon, UserIcon } from "./Icons";

const TABS = [
  { href: "/home",          icon: HomeIcon,     label: "Home"          },
  { href: "/explore",       icon: ExploreIcon,  label: "Explore"       },
  { href: "/notifications", icon: BellIcon,     label: "Notifications" },
  { href: "/bookmarks",     icon: BookmarkIcon, label: "Bookmarks"     },
];

export default function TabBar({ username }: { username?: string }) {
  const pathname = usePathname();

  const all = username
    ? [...TABS, { href: `/${username}`, icon: UserIcon, label: "Profile" }]
    : TABS;

  return (
    <nav
      aria-label="Main navigation"
      style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        background: "rgba(18, 15, 23, 0.88)",
        backdropFilter: "blur(24px) saturate(1.4)",
        WebkitBackdropFilter: "blur(24px) saturate(1.4)",
        border: "1px solid var(--div-strong)",
        borderRadius: 999,
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {all.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || (href !== "/home" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            title={label}
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 40,
              textDecoration: "none",
              color: active ? "var(--t-hi)" : "rgba(255,255,255,0.28)",
              gap: 4,
              transition: `color ${200}ms var(--ease-spring)`,
            }}
          >
            <Icon size={22} />
            {active && (
              <span
                style={{
                  width: 20,
                  height: 3,
                  borderRadius: 999,
                  background: "linear-gradient(90deg, var(--accent-a), var(--accent-b))",
                  position: "absolute",
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
