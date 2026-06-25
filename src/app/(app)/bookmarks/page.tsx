"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import PostCard from "@/components/PostCard";
import PostSkeleton from "@/components/PostSkeleton";
import { useAuth } from "@/lib/auth";
import * as api from "@/lib/api";

const LIMIT = 20;

export default function BookmarksPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<api.FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchPage = useCallback(async (offset: number, append: boolean) => {
    const { posts: raw } = await api.listBookmarks({ limit: LIMIT, offset });
    const items: api.FeedItem[] = raw.map((p) => ({
      ...p,
      type: "post" as const,
      repostedBy: null,
      repostedAt: null,
    }));
    setPosts((prev) => append ? [...prev, ...items] : items);
    setHasMore(raw.length === LIMIT);
  }, []);

  useEffect(() => {
    offsetRef.current = 0;
    setLoading(true);
    fetchPage(0, false).finally(() => setLoading(false));
  }, [fetchPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
        const next = offsetRef.current + LIMIT;
        offsetRef.current = next;
        setLoadingMore(true);
        fetchPage(next, true).finally(() => setLoadingMore(false));
      }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, fetchPage]);

  const username = user?.profile?.username;

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
        }}
      >
        <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.4px", color: "var(--t-hi)" }}>
          Bookmarks
        </span>
      </div>

      {loading ? (
        Array.from({ length: 5 }).map((_, i) => <PostSkeleton key={i} />)
      ) : posts.length === 0 ? (
        <div style={{ padding: "80px 24px", textAlign: "center" }}>
          <p style={{ fontWeight: 900, fontSize: 20, color: "var(--t-hi)", margin: "0 0 6px" }}>No bookmarks yet.</p>
          <p style={{ fontSize: 15, color: "var(--t-md)", margin: 0 }}>
            Save posts to read them later.
          </p>
        </div>
      ) : (
        <>
          {posts.map((item) => (
            <PostCard key={item.id} item={item} currentUsername={username} />
          ))}
          <div ref={sentinelRef} style={{ height: 40 }}>
            {loadingMore && Array.from({ length: 2 }).map((_, i) => <PostSkeleton key={i} />)}
          </div>
          {!hasMore && posts.length > 0 && (
            <p style={{ padding: "24px 0", textAlign: "center", fontSize: 13, color: "var(--t-lo)" }}>
              All caught up.
            </p>
          )}
        </>
      )}
    </div>
  );
}
