"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { ChevronLeftIcon } from "@/components/Icons";
import * as api from "@/lib/api";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [blocked, setBlocked]     = useState<api.ProfileSummary[]>([]);
  const [loading, setLoading]     = useState(true);
  const [unblocking, setUnblocking] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.getBlockedUsers({ limit: 100 })
      .then(({ profiles }) => setBlocked(profiles))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUnblock = useCallback(async (username: string) => {
    setUnblocking((s) => new Set(s).add(username));
    try {
      await api.unblockUser(username);
      setBlocked((prev) => prev.filter((p) => p.username !== username));
    } catch {
      /* silent */
    } finally {
      setUnblocking((s) => {
        const next = new Set(s);
        next.delete(username);
        return next;
      });
    }
  }, []);

  const profile = user?.profile;
  const displayName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.username
    : "";

  return (
    <div>
      {/* Header */}
      <div
        style={{
          height: 52,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 16px",
          borderBottom: "1px solid var(--div)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "var(--bg-overlay)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          style={{
            background: "none",
            border: "none",
            color: "var(--t-md)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: 4,
            borderRadius: 8,
          }}
        >
          <ChevronLeftIcon size={20} />
        </button>
        <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: "-0.25px", color: "var(--t-hi)" }}>
          Account
        </span>
      </div>

      <div style={{ padding: "16px 16px 48px" }}>
        {/* Account info */}
        <div
          style={{
            borderRadius: 14,
            border: "1px solid var(--div)",
            background: "var(--bg-surface)",
            overflow: "hidden",
          }}
        >
          {[
            { label: "Display name", value: displayName },
            { label: "Username", value: profile ? `@${profile.username}` : "" },
            { label: "Email", value: user?.email ?? "—" },
            {
              label: "Member since",
              value: profile?.createdAt ? formatDate(profile.createdAt) : "—",
            },
          ].map(({ label, value }, i, arr) => (
            <div
              key={label}
              style={{
                padding: "13px 16px",
                borderBottom: i < arr.length - 1 ? "1px solid var(--div)" : "none",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 14, color: "var(--t-md)", flexShrink: 0 }}>{label}</span>
              <span
                style={{
                  fontSize: 14,
                  color: "var(--t-hi)",
                  fontWeight: 500,
                  textAlign: "right",
                  wordBreak: "break-all",
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Blocked users */}
        <div
          style={{
            marginTop: 28,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: "var(--t-lo)",
            marginBottom: 10,
          }}
        >
          Blocked users
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 1, borderRadius: 14, overflow: "hidden", border: "1px solid var(--div)", background: "var(--bg-surface)" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: i < 2 ? "1px solid var(--div)" : "none" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg-raised)" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ width: 100, height: 12, borderRadius: 6, background: "var(--bg-raised)", marginBottom: 6 }} />
                  <div style={{ width: 70, height: 10, borderRadius: 6, background: "var(--bg-raised)" }} />
                </div>
              </div>
            ))}
          </div>
        ) : blocked.length === 0 ? (
          <div
            style={{
              padding: "32px 16px",
              textAlign: "center",
              borderRadius: 14,
              border: "1px solid var(--div)",
              background: "var(--bg-surface)",
            }}
          >
            <p style={{ fontSize: 15, color: "var(--t-md)", margin: 0 }}>No blocked users.</p>
          </div>
        ) : (
          <div
            style={{
              borderRadius: 14,
              overflow: "hidden",
              border: "1px solid var(--div)",
              background: "var(--bg-surface)",
            }}
          >
            {blocked.map((p, i) => {
              const name =
                [p.firstName, p.lastName].filter(Boolean).join(" ") || p.username;
              const isUnblocking = unblocking.has(p.username);
              return (
                <div
                  key={p.username}
                  style={{
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    borderBottom: i < blocked.length - 1 ? "1px solid var(--div)" : "none",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      overflow: "hidden",
                      background: "var(--bg-raised)",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--t-md)",
                    }}
                  >
                    {p.avatar ? (
                      <Image
                        src={p.avatar}
                        alt={name}
                        width={36}
                        height={36}
                        style={{ objectFit: "cover", borderRadius: "50%" }}
                      />
                    ) : (
                      (p.firstName?.[0] ?? p.username[0]).toUpperCase()
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--t-hi)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {name}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--t-md)" }}>@{p.username}</div>
                  </div>
                  <button
                    onClick={() => handleUnblock(p.username)}
                    disabled={isUnblocking}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 999,
                      border: "1px solid var(--div-strong)",
                      background: "transparent",
                      color: "var(--t-hi)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: isUnblocking ? "default" : "pointer",
                      fontFamily: "inherit",
                      opacity: isUnblocking ? 0.5 : 1,
                      flexShrink: 0,
                      transition: "opacity 150ms",
                    }}
                  >
                    {isUnblocking ? "…" : "Unblock"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
