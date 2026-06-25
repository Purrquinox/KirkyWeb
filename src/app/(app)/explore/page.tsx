"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import PostSkeleton from "@/components/PostSkeleton";
import { useAuth } from "@/lib/auth";
import * as api from "@/lib/api";

type Window = api.TrendingWindow;

const WINDOWS: { value: Window; label: string }[] = [
  { value: "24h", label: "Today" },
  { value: "7d",  label: "This week" },
  { value: "30d", label: "This month" },
];

export default function ExplorePage() {
  const { user } = useAuth();
  const [window, setWindow] = useState<Window>("24h");
  const [data, setData] = useState<Awaited<ReturnType<typeof api.getExplore>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getExplore({ window }).then((d) => {
      setData(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [window]);

  const username = user?.profile?.username;
  const feedItems: api.FeedItem[] = (data?.trendingPosts ?? []).map((p) => ({
    ...p,
    type: "post" as const,
    repostedBy: null,
    repostedAt: null,
  }));

  return (
    <div>
      {/* Header */}
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
          gap: 12,
        }}
      >
        <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.4px", color: "var(--t-hi)", flex: 1 }}>
          Explore
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {WINDOWS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setWindow(value)}
              style={{
                padding: "5px 12px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 12,
                fontWeight: 600,
                color: window === value ? "var(--t-hi)" : "var(--t-md)",
                background: window === value ? "var(--bg-surface)" : "transparent",
                transition: "all 160ms var(--ease-out)",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Trending hashtags */}
      {(loading || (data?.trendingHashtags?.length ?? 0) > 0) && (
        <div style={{ padding: "16px 16px 0" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--t-lo)", margin: "0 0 10px" }}>
            Trending
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{ height: 32, width: 60 + (i % 3) * 20, borderRadius: 999, background: "var(--bg-surface)" }} />
                ))
              : data?.trendingHashtags.map(({ tag, postsCount }) => (
                  <Link
                    key={tag}
                    href={`/search?q=%23${tag}`}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 999,
                      background: "var(--bg-surface)",
                      color: "var(--t-hi)",
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    #{tag}
                    <span style={{ fontSize: 11, color: "var(--t-lo)", fontWeight: 400 }}>
                      {postsCount.toLocaleString()}
                    </span>
                  </Link>
                ))
            }
          </div>
          <div style={{ borderTop: "1px solid var(--div)", marginBottom: 0 }} />
        </div>
      )}

      {/* Trending posts */}
      <div style={{ padding: "8px 0 0" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--t-lo)", margin: "8px 16px 0" }}>
          Top posts
        </p>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <PostSkeleton key={i} />)
          : feedItems.length === 0
          ? (
            <div style={{ padding: "60px 24px", textAlign: "center" }}>
              <p style={{ fontWeight: 900, fontSize: 20, color: "var(--t-hi)", margin: "0 0 6px" }}>Nothing trending yet.</p>
              <p style={{ fontSize: 15, color: "var(--t-md)", margin: 0 }}>Check back soon.</p>
            </div>
          )
          : feedItems.map((item) => (
            <PostCard key={item.id} item={item} currentUsername={username} />
          ))
        }
      </div>
    </div>
  );
}
