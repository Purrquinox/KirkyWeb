"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";
import PostCard from "@/components/PostCard";
import PostSkeleton from "@/components/PostSkeleton";
import { useAuth } from "@/lib/auth";
import { ExploreIcon, VerifiedIcon } from "@/components/Icons";
import * as api from "@/lib/api";

type Tab = "posts" | "people" | "tags";

export default function SearchPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [submitted, setSubmitted] = useState(searchParams.get("q") ?? "");
  const [tab, setTab] = useState<Tab>("posts");
  const [results, setResults] = useState<Awaited<ReturnType<typeof api.searchAll>> | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useCallback((q: string) => {
    const trimmed = q.trim();
    if (!trimmed) { setResults(null); return; }
    setLoading(true);
    api.searchAll({ q: trimmed, limit: 20 }).then((r) => {
      setResults(r);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    setQuery(q);
    setSubmitted(q);
    if (q) search(q);
  }, [searchParams, search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    setSubmitted(trimmed);
    search(trimmed);
  };

  const username = user?.profile?.username;

  const postItems: api.FeedItem[] = (results?.posts ?? []).map((p) => ({
    ...p,
    type: "post" as const,
    repostedBy: null,
    repostedAt: null,
  }));

  const hasResults = results && (results.posts.length > 0 || results.users.length > 0 || results.hashtags.length > 0);

  return (
    <div>
      {/* Search bar header */}
      <div
        style={{
          padding: "10px 16px",
          borderBottom: "1px solid var(--div)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "var(--bg-overlay)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "var(--bg-surface)",
              borderRadius: 999,
              padding: "0 16px",
              height: 40,
            }}
          >
            <span style={{ color: "var(--t-lo)", flexShrink: 0, lineHeight: 0 }}>
              <ExploreIcon size={16} />
            </span>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Kirky"
              autoComplete="off"
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                color: "var(--t-hi)",
                fontSize: 15,
                fontFamily: "inherit",
              }}
            />
          </div>
        </form>
      </div>

      {/* Tabs — only show when there are results */}
      {submitted && !loading && hasResults && (
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--div)",
            position: "sticky",
            top: 60,
            zIndex: 9,
            background: "var(--bg-overlay)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          {(["posts", "people", "tags"] as Tab[]).map((t) => {
            const counts: Record<Tab, number> = {
              posts:  results?.posts.length ?? 0,
              people: results?.users.length ?? 0,
              tags:   results?.hashtags.length ?? 0,
            };
            const labels: Record<Tab, string> = { posts: "Posts", people: "People", tags: "Tags" };
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  padding: "13px 0",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: active ? 700 : 400,
                  color: active ? "var(--t-hi)" : "var(--t-md)",
                  fontFamily: "inherit",
                  position: "relative",
                  transition: "color 200ms var(--ease-out)",
                }}
              >
                {labels[t]}
                {counts[t] > 0 && (
                  <span style={{ marginLeft: 5, fontSize: 12, color: "var(--t-lo)" }}>
                    {counts[t]}
                  </span>
                )}
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
      )}

      {/* Content */}
      {!submitted ? (
        <div style={{ padding: "80px 24px", textAlign: "center" }}>
          <p style={{ fontWeight: 900, fontSize: 20, color: "var(--t-hi)", margin: "0 0 6px" }}>Find anything.</p>
          <p style={{ fontSize: 15, color: "var(--t-md)", margin: 0 }}>Search for posts, people, or hashtags.</p>
        </div>
      ) : loading ? (
        Array.from({ length: 5 }).map((_, i) => <PostSkeleton key={i} />)
      ) : !hasResults ? (
        <div style={{ padding: "80px 24px", textAlign: "center" }}>
          <p style={{ fontWeight: 900, fontSize: 20, color: "var(--t-hi)", margin: "0 0 6px" }}>No results.</p>
          <p style={{ fontSize: 15, color: "var(--t-md)", margin: 0 }}>Try a different search.</p>
        </div>
      ) : tab === "posts" ? (
        postItems.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <p style={{ fontSize: 15, color: "var(--t-md)", margin: 0 }}>No posts found.</p>
          </div>
        ) : postItems.map((item) => (
          <PostCard key={item.id} item={item} currentUsername={username} />
        ))
      ) : tab === "people" ? (
        results!.users.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <p style={{ fontSize: 15, color: "var(--t-md)", margin: 0 }}>No people found.</p>
          </div>
        ) : results!.users.map((profile) => {
          const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.username;
          return (
            <Link
              key={profile.username}
              href={`/${profile.username}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                borderBottom: "1px solid var(--div)",
                textDecoration: "none",
                transition: "background 150ms",
              }}
            >
              <UserAvatar
                username={profile.username}
                firstName={profile.firstName}
                lastName={profile.lastName}
                avatar={profile.avatar}
                size={44}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 1 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "var(--t-hi)", letterSpacing: "-0.2px" }}>
                    {name}
                  </span>
                  {profile.verified && <VerifiedIcon size={14} />}
                </div>
                <span style={{ fontSize: 13, color: "var(--t-md)" }}>@{profile.username}</span>
                {profile.bio && (
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 13,
                      color: "var(--t-md)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {profile.bio}
                  </p>
                )}
              </div>
            </Link>
          );
        })
      ) : (
        results!.hashtags.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <p style={{ fontSize: 15, color: "var(--t-md)", margin: 0 }}>No hashtags found.</p>
          </div>
        ) : results!.hashtags.map(({ tag, postsCount }) => (
          <Link
            key={tag}
            href={`/search?q=%23${tag}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderBottom: "1px solid var(--div)",
              textDecoration: "none",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--t-hi)" }}>#{tag}</span>
            <span style={{ fontSize: 13, color: "var(--t-lo)" }}>{postsCount.toLocaleString()} posts</span>
          </Link>
        ))
      )}
    </div>
  );
}
