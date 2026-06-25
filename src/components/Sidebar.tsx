"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, ExploreIcon, BellIcon, BookmarkIcon, UserIcon, SettingsIcon } from "./Icons";

const NAV = [
  { href: "/home",          icon: HomeIcon,     label: "Home"          },
  { href: "/explore",       icon: ExploreIcon,  label: "Explore"       },
  { href: "/notifications", icon: BellIcon,     label: "Notifications" },
  { href: "/bookmarks",     icon: BookmarkIcon, label: "Bookmarks"     },
];

interface SidebarProps {
  username?: string;
  onCompose?: () => void;
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={active ? "nav-link nav-link-active" : "nav-link"}
      style={{
        color: active ? "var(--t-hi)" : "var(--t-lo)",
        fontWeight: active ? 600 : 400,
        letterSpacing: active ? "-0.01em" : "0",
      }}
    >
      <Icon size={20} />
      {label}
    </Link>
  );
}

export default function Sidebar({ username, onCompose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 220,
        height: "100dvh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        padding: "16px 12px 24px",
        borderRight: "1px solid var(--div)",
        flexShrink: 0,
      }}
    >
      {/* Wordmark */}
      <Link
        href="/home"
        style={{ textDecoration: "none", display: "block", marginBottom: 20, paddingLeft: 10 }}
        aria-label="Kirky home"
      >
        <span className="wordmark">kirky</span>
      </Link>

      {/* Write / Compose button */}
      <button
        onClick={onCompose}
        style={{
          width: "100%",
          padding: "9px 14px",
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
          background: "linear-gradient(135deg, var(--accent-a), var(--accent-b))",
          color: "rgba(255,255,255,0.95)",
          fontSize: 14,
          fontWeight: 700,
          fontFamily: "inherit",
          letterSpacing: "-0.01em",
          textAlign: "center",
          marginBottom: 16,
          transition: "opacity 160ms var(--ease-out)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
      >
        Write
      </button>

      {/* Nav items */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(({ href, icon, label }) => (
          <NavItem
            key={href}
            href={href}
            icon={icon}
            label={label}
            active={pathname === href || pathname.startsWith(href + "/")}
          />
        ))}

        {username && (
          <NavItem
            href={`/${username}`}
            icon={UserIcon}
            label="Profile"
            active={pathname === `/${username}`}
          />
        )}
      </nav>

      {/* Settings */}
      <NavItem
        href="/settings"
        icon={SettingsIcon}
        label="Settings"
        active={pathname.startsWith("/settings")}
      />
    </aside>
  );
}
