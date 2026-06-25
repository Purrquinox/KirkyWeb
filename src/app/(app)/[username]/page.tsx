"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import UserAvatar from "@/components/UserAvatar";
import PostCard from "@/components/PostCard";
import PostSkeleton from "@/components/PostSkeleton";
import { ChevronLeftIcon, VerifiedIcon } from "@/components/Icons";
import * as api from "@/lib/api";

function StatPill({ value, label, href }: { value: number; label: string; href?: string }) {
  const content = (
    <span style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
      <span style={{ fontWeight: 900, fontSize: 16, color: "var(--t-hi)", letterSpacing: "-0.3px" }}>
        {value.toLocaleString()}
      </span>
      <span style={{ fontSize: 13, color: "var(--t-md)" }}>{label}</span>
    </span>
  );
  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none" }}>
        {content}
      </Link>
    );
  }
  return content;
}

export default function ProfilePage() {
  const params = useParams<{ username: string }>();
  const { user: me } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<api.PublicProfile | null>(null);
  const [posts, setPosts] = useState<api.Post[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const username = params.username;
  const isOwn = me?.profile?.username === username;

  useEffect(() => {
    setLoadingProfile(true);
    setLoadingPosts(true);
    setNotFound(false);

    api.getProfile(username)
      .then(({ profile }) => {
        setProfile(profile);
        setFollowing(profile.isFollowing);
        setLoadingProfile(false);
      })
      .catch((err) => {
        if (err?.status === 404) setNotFound(true);
        setLoadingProfile(false);
      });

    api.getUserPosts(username, { limit: 30 })
      .then(({ posts }) => {
        setPosts(posts);
        setLoadingPosts(false);
      })
      .catch(() => setLoadingPosts(false));
  }, [username]);

  const handleFollow = useCallback(async () => {
    if (followLoading || !profile) return;
    setFollowLoading(true);
    const next = !following;
    setFollowing(next);
    try {
      await (next ? api.followUser(username) : api.unfollowUser(username));
    } catch {
      setFollowing(!next);
    } finally {
      setFollowLoading(false);
    }
  }, [following, followLoading, profile, username]);

  if (notFound) {
    return (
      <div style={{ padding: "80px 24px", textAlign: "center" }}>
        <p style={{ fontWeight: 900, fontSize: 22, color: "var(--t-hi)", margin: "0 0 8px" }}>
          User not found.
        </p>
        <p style={{ fontSize: 15, color: "var(--t-md)", margin: 0 }}>
          @{username} doesn&apos;t exist.
        </p>
      </div>
    );
  }

  const feedItems: api.FeedItem[] = posts.map((p) => ({
    ...p,
    type: "post" as const,
    repostedBy: null,
    repostedAt: null,
  }));

  const displayName = profile
    ? ([profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.username)
    : username;

  return (
    <div>
      {/* Back + title bar */}
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
        <div>
          <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: "-0.25px", color: "var(--t-hi)" }}>
            {displayName}
          </div>
          {profile && (
            <div style={{ fontSize: 12, color: "var(--t-md)" }}>
              {posts.length} posts
            </div>
          )}
        </div>
      </div>

      {/* Banner */}
      <div
        style={{
          position: "relative",
          height: 120,
          background: "linear-gradient(135deg, var(--accent-a) 0%, var(--accent-b) 100%)",
          opacity: loadingProfile ? 0.4 : 1,
          transition: "opacity 300ms",
          overflow: "hidden",
        }}
      >
        {profile?.bannerImage && (
          <Image
            src={profile.bannerImage}
            alt=""
            fill
            sizes="(max-width: 1100px) 100vw, 700px"
            style={{ objectFit: "cover" }}
            priority
          />
        )}
      </div>

      {/* Profile header */}
      <div style={{ padding: "0 16px 16px", position: "relative" }}>
        {/* Avatar + follow button row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginTop: -24,
            marginBottom: 12,
          }}
        >
          {loadingProfile ? (
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "var(--bg-surface)",
                border: "3px solid var(--bg)",
              }}
            />
          ) : profile ? (
            <div style={{ border: "3px solid var(--bg)", borderRadius: "50%", lineHeight: 0 }}>
              <UserAvatar
                username={profile.username}
                firstName={profile.firstName}
                lastName={profile.lastName}
                avatar={profile.avatar}
                size={72}
                isOwn={isOwn}
              />
            </div>
          ) : null}

          {!loadingProfile && profile && (
            <div>
              {isOwn ? (
                <Link
                  href="/settings/profile"
                  style={{
                    padding: "8px 18px",
                    borderRadius: 999,
                    border: "1px solid var(--div-strong)",
                    color: "var(--t-hi)",
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Edit profile
                </Link>
              ) : (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 999,
                    border: following ? "1px solid var(--div-strong)" : "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--t-hi)",
                    background: following
                      ? "transparent"
                      : "linear-gradient(135deg, var(--accent-a), var(--accent-b))",
                    transition: "all 200ms var(--ease-spring)",
                    opacity: followLoading ? 0.6 : 1,
                  }}
                >
                  {following ? "Following" : "Follow"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Name + username */}
        {loadingProfile ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ width: 140, height: 18, borderRadius: 6, background: "var(--bg-surface)" }} />
            <div style={{ width: 90, height: 13, borderRadius: 6, background: "var(--bg-surface)" }} />
          </div>
        ) : profile ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <span
                style={{
                  fontWeight: 900,
                  fontSize: 20,
                  letterSpacing: "-0.4px",
                  color: "var(--t-hi)",
                }}
              >
                {displayName}
              </span>
              {profile.verified && <VerifiedIcon size={18} />}
            </div>
            <div style={{ fontSize: 14, color: "var(--t-md)", marginBottom: 12 }}>
              @{profile.username}
            </div>

            {profile.bio && (
              <p
                style={{
                  fontSize: 15,
                  color: "var(--t-hi)",
                  lineHeight: 1.55,
                  margin: "0 0 12px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {profile.bio}
              </p>
            )}

            {/* Stats */}
            <div style={{ display: "flex", gap: 20 }}>
              <StatPill
                value={profile.followingCount}
                label="following"
                href={`/${username}/following`}
              />
              <StatPill
                value={profile.followersCount}
                label="followers"
                href={`/${username}/followers`}
              />
            </div>
          </>
        ) : null}
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--div)" }} />

      {/* Posts */}
      {loadingPosts
        ? Array.from({ length: 4 }).map((_, i) => <PostSkeleton key={i} />)
        : feedItems.length === 0
        ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <p style={{ fontWeight: 900, fontSize: 20, color: "var(--t-hi)", margin: "0 0 6px" }}>
              No posts yet.
            </p>
            {isOwn && (
              <p style={{ fontSize: 15, color: "var(--t-md)", margin: 0 }}>
                Share something with your followers.
              </p>
            )}
          </div>
        )
        : feedItems.map((item) => (
          <PostCard key={item.id} item={item} currentUsername={me?.profile?.username} />
        ))
      }
    </div>
  );
}
