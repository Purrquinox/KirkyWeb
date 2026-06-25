"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { UserIcon, ShieldIcon, LogOutIcon, ChevronRightIcon } from "@/components/Icons";

interface RowProps {
  href?: string;
  onClick?: () => void;
  icon: React.ComponentType<{ size?: number }>;
  iconBg?: string;
  iconColor?: string;
  label: string;
  description?: string;
  danger?: boolean;
}

function SettingsRow({ href, onClick, icon: Icon, iconBg, iconColor, label, description, danger }: RowProps) {
  const inner = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "13px 16px",
        cursor: "pointer",
        transition: "background 120ms",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: iconBg ?? (danger ? "rgba(255,80,80,0.12)" : "var(--bg-raised)"),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: iconColor ?? (danger ? "#FF5050" : "var(--t-md)"),
          flexShrink: 0,
        }}
      >
        <Icon size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: danger ? "#FF5050" : "var(--t-hi)" }}>
          {label}
        </div>
        {description && (
          <div style={{ fontSize: 13, color: "var(--t-md)", marginTop: 2 }}>{description}</div>
        )}
      </div>
      {href && (
          <span style={{ color: "var(--t-lo)", flexShrink: 0, display: "flex" }}>
            <ChevronRightIcon size={16} />
          </span>
        )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none", display: "block" }}>
        {inner}
      </Link>
    );
  }
  return <div onClick={onClick}>{inner}</div>;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div
      style={{
        padding: "20px 16px 8px",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: "var(--t-lo)",
      }}
    >
      {title}
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await logout();
    router.replace("/login");
  }, [logout, router]);

  const displayName = user?.profile
    ? [user.profile.firstName, user.profile.lastName].filter(Boolean).join(" ") || user.profile.username
    : user?.email ?? "Account";

  return (
    <div>
      {/* Header */}
      <div
        style={{
          height: 52,
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          borderBottom: "1px solid var(--div)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "var(--bg-overlay)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.3px", color: "var(--t-hi)" }}>
          Settings
        </span>
      </div>

      {/* Account info chip */}
      {user && (
        <div
          style={{
            margin: "16px 16px 0",
            padding: "14px 16px",
            borderRadius: 14,
            border: "1px solid var(--div)",
            background: "var(--bg-surface)",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--t-hi)" }}>{displayName}</div>
          {user.email && (
            <div style={{ fontSize: 13, color: "var(--t-md)", marginTop: 2 }}>{user.email}</div>
          )}
          {user.profile?.username && (
            <div style={{ fontSize: 13, color: "var(--t-lo)", marginTop: 1 }}>@{user.profile.username}</div>
          )}
        </div>
      )}

      {/* Profile section */}
      <SectionHeader title="Profile" />
      <div style={{ margin: "0 16px", borderRadius: 14, overflow: "hidden", border: "1px solid var(--div)", background: "var(--bg-surface)" }}>
        <SettingsRow
          href="/settings/profile"
          icon={UserIcon}
          label="Edit profile"
          description="Name, bio, photo, website"
        />
      </div>

      {/* Privacy section */}
      <SectionHeader title="Privacy & Safety" />
      <div style={{ margin: "0 16px", borderRadius: 14, overflow: "hidden", border: "1px solid var(--div)", background: "var(--bg-surface)" }}>
        <SettingsRow
          href="/settings/account"
          icon={ShieldIcon}
          label="Account & blocked users"
          description="Manage your account and blocked users"
        />
      </div>

      {/* Sign out */}
      <SectionHeader title="Session" />
      <div style={{ margin: "0 16px 40px", borderRadius: 14, overflow: "hidden", border: "1px solid var(--div)", background: "var(--bg-surface)" }}>
        <SettingsRow
          onClick={handleLogout}
          icon={LogOutIcon}
          label="Sign out"
          danger
        />
      </div>
    </div>
  );
}
