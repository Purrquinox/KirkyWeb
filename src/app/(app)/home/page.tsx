"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import PostCard from "@/components/PostCard";
import PostSkeleton from "@/components/PostSkeleton";
import * as api from "@/lib/api";

type Tab = "following" | "foryou";

const LIMIT = 20;

export default function HomePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("following");
  const [posts, setPosts] = useState<api.FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchFeed = useCallback(async (activeTab: Tab, offset: number, append: boolean) => {
    try {
      if (activeTab === "following") {
        const { items, hasMore } = await api.getFollowingFeed({ limit: LIMIT, offset });
        setPosts((prev) => append ? [...prev, ...items] : items);
        setHasMore(hasMore);
      } else {
        const { items, hasMore } = await api.getForYouFeed({ limit: LIMIT, offset });
        const feedItems: api.FeedItem[] = items.map((p) => ({
          ...p,
          type: "post" as const,
          repostedBy: null,
          repostedAt: null,
        }));
        setPosts((prev) => append ? [...prev, ...feedItems] : feedItems);
        setHasMore(hasMore);
      }
    } catch {
      // leave current posts in place
    }
  }, []);

  // Reset on tab change
  useEffect(() => {
    offsetRef.current = 0;
    setLoading(true);
    setPosts([]);
    setHasMore(true);
    fetchFeed(tab, 0, false).finally(() => setLoading(false));
  }, [tab, fetchFeed]);

  // Infinite scroll sentinel
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const nextOffset = offsetRef.current + LIMIT;
          offsetRef.current = nextOffset;
          setLoadingMore(true);
          fetchFeed(tab, nextOffset, true).finally(() => setLoadingMore(false));
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [tab, hasMore, loadingMore, loading, fetchFeed]);

  const username = user?.profile?.username;

  return (
    <div>
      {/* Feed tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--div)",
          position: "sticky",
          top: 52,
          zIndex: 9,
          background: "var(--bg-overlay)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {(["following", "foryou"] as Tab[]).map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: "14px 0",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: active ? 700 : 400,
                color: active ? "var(--t-hi)" : "var(--t-md)",
                fontFamily: "inherit",
                letterSpacing: active ? "-0.01em" : "0",
                position: "relative",
                transition: "color 200ms var(--ease-out), font-weight 200ms",
              }}
            >
              {t === "following" ? "Following" : "For You"}
              {active && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 40,
                    height: 3,
                    borderRadius: 999,
                    background: "linear-gradient(90deg, var(--accent-a), var(--accent-b))",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Feed content */}
      {loading ? (
        Array.from({ length: 5 }).map((_, i) => <PostSkeleton key={i} />)
      ) : posts.length === 0 ? (
        <div
          style={{
            padding: "80px 24px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: "-0.3px",
              color: "var(--t-hi)",
              margin: "0 0 8px",
            }}
          >
            Nothing here yet.
          </p>
          <p style={{ fontSize: 15, color: "var(--t-md)", margin: 0 }}>
            {tab === "following"
              ? "Follow some people to see their posts here."
              : "Check back soon for trending posts."}
          </p>
        </div>
      ) : (
        <>
          {posts.map((item) => (
            <PostCard key={`${item.id}-${item.type}`} item={item} currentUsername={username} />
          ))}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} style={{ height: 40 }}>
            {loadingMore && (
              <div style={{ padding: 16, display: "flex", justifyContent: "center" }}>
                {Array.from({ length: 2 }).map((_, i) => <PostSkeleton key={i} />)}
              </div>
            )}
          </div>

          {!hasMore && posts.length > 0 && (
            <p
              style={{
                padding: "24px 0",
                textAlign: "center",
                fontSize: 13,
                color: "var(--t-lo)",
              }}
            >
              You&apos;re all caught up.
            </p>
          )}
        </>
      )}
    </div>
  );
}
