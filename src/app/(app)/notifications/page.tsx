"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";
import PostSkeleton from "@/components/PostSkeleton";
import * as api from "@/lib/api";

const ACTION: Record<api.NotificationType, string> = {
  FOLLOW:       "followed you",
  LIKE_POST:    "liked your post",
  LIKE_COMMENT: "liked your comment",
  COMMENT:      "commented on your post",
  REPOST:       "reposted your post",
  QUOTE:        "quoted your post",
  MENTION:      "mentioned you",
};

function NotificationRow({ n, onRead }: { n: api.Notification; onRead: (id: string) => void }) {
  const profile = n.actor.profile;
  const name = profile
    ? ([profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.username)
    : "Someone";

  const handleClick = () => {
    if (!n.read) onRead(n.id);
  };

  const inner = (
    <div
      onClick={handleClick}
      style={{
        display: "flex",
        gap: 12,
        padding: "14px 16px",
        borderBottom: "1px solid var(--div)",
        background: n.read ? "transparent" : "rgba(102,51,204,0.05)",
        cursor: n.post ? "pointer" : "default",
        transition: "background 200ms",
      }}
    >
      {!n.read && (
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--accent-a)",
            flexShrink: 0,
            marginTop: 8,
          }}
        />
      )}
      {n.read && <div style={{ width: 6, flexShrink: 0 }} />}

      {profile ? (
        <UserAvatar
          username={profile.username}
          firstName={profile.firstName}
          lastName={profile.lastName}
          avatar={profile.avatar}
          size={38}
        />
      ) : (
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--bg-surface)", flexShrink: 0 }} />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: "0 0 2px", fontSize: 14, lineHeight: 1.4 }}>
          {profile ? (
            <Link
              href={`/${profile.username}`}
              onClick={(e) => e.stopPropagation()}
              style={{ fontWeight: 700, color: "var(--t-hi)", textDecoration: "none" }}
            >
              {name}
            </Link>
          ) : (
            <span style={{ fontWeight: 700, color: "var(--t-hi)" }}>{name}</span>
          )}{" "}
          <span style={{ color: "var(--t-md)" }}>{ACTION[n.type]}</span>
        </p>
        {n.post && (
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "var(--t-lo)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {n.post.content}
          </p>
        )}
      </div>
    </div>
  );

  if (n.post) {
    return (
      <Link href={`/post/${n.post.id}`} style={{ textDecoration: "none", display: "block" }}>
        {inner}
      </Link>
    );
  }

  return inner;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<api.Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    api.listNotifications({ limit: 50 }).then(({ notifications }) => {
      setNotifications(notifications);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    api.markNotificationRead(id).catch(() => {});
  }, []);

  const markAll = useCallback(async () => {
    if (markingAll) return;
    setMarkingAll(true);
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } finally {
      setMarkingAll(false);
    }
  }, [markingAll]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <div
        style={{
          height: 52,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          borderBottom: "1px solid var(--div)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "var(--bg-overlay)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          gap: 8,
        }}
      >
        <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.4px", color: "var(--t-hi)", flex: 1 }}>
          Notifications
        </span>
        {unreadCount > 0 && (
          <button
            onClick={markAll}
            disabled={markingAll}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--accent-a)",
              fontFamily: "inherit",
              opacity: markingAll ? 0.5 : 1,
              padding: "4px 0",
            }}
          >
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        Array.from({ length: 6 }).map((_, i) => <PostSkeleton key={i} />)
      ) : notifications.length === 0 ? (
        <div style={{ padding: "80px 24px", textAlign: "center" }}>
          <p style={{ fontWeight: 900, fontSize: 20, color: "var(--t-hi)", margin: "0 0 6px" }}>All clear.</p>
          <p style={{ fontSize: 15, color: "var(--t-md)", margin: 0 }}>No notifications yet.</p>
        </div>
      ) : (
        notifications.map((n) => (
          <NotificationRow key={n.id} n={n} onRead={markRead} />
        ))
      )}
    </div>
  );
}
