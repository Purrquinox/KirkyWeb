"use client";

import Link from "next/link";
import Image from "next/image";
import type { FeedItem, Post } from "@/lib/api";
import UserAvatar from "./UserAvatar";
import PostActionBar from "./PostActionBar";
import { VerifiedIcon, RepeatIcon } from "./Icons";

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function AuthorName({ profile }: { profile: NonNullable<Post["author"]["profile"]> }) {
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.username;
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ fontWeight: 900, fontSize: 15, letterSpacing: "-0.25px", color: "var(--t-hi)" }}>
        {name}
      </span>
      {profile.verified && <VerifiedIcon size={14} />}
      <span style={{ fontSize: 14, color: "var(--t-md)", marginLeft: 1 }}>
        @{profile.username}
      </span>
    </span>
  );
}

function QuoteCard({ post }: { post: NonNullable<Post["quoteOf"]> }) {
  const profile = post.author.profile;
  const name = profile
    ? ([profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.username)
    : "Unknown";

  return (
    <div
      style={{
        border: "1px solid var(--div-strong)",
        borderRadius: 12,
        padding: "10px 14px",
        marginTop: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        {profile && (
          <UserAvatar
            username={profile.username}
            firstName={profile.firstName}
            lastName={profile.lastName}
            avatar={profile.avatar}
            size={18}
          />
        )}
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--t-hi)" }}>{name}</span>
        <span style={{ fontSize: 13, color: "var(--t-md)" }}>
          @{profile?.username} · {relativeTime(post.createdAt)}
        </span>
      </div>
      <p style={{ fontSize: 14, color: "var(--t-md)", margin: 0, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
        {post.content}
      </p>
    </div>
  );
}

interface PostCardProps {
  item: FeedItem;
  currentUsername?: string;
}

export default function PostCard({ item, currentUsername }: PostCardProps) {
  const { author, content, imageUrl, quoteOf, createdAt, hashtags } = item;
  const profile = author.profile;
  const isOwn   = profile?.username === currentUsername;

  return (
    <article
      style={{
        borderBottom: "1px solid var(--div)",
        padding: "14px 16px",
      }}
    >
      {item.type === "repost" && item.repostedBy && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8,
            fontSize: 12,
            color: "var(--t-md)",
            paddingLeft: 44,
          }}
        >
          <RepeatIcon size={13} />
          <Link
            href={`/${item.repostedBy.username}`}
            style={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}
          >
            {item.repostedBy.firstName ?? item.repostedBy.username} reposted
          </Link>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        {profile ? (
          <Link href={`/${profile.username}`} style={{ flexShrink: 0, lineHeight: 0 }}>
            <UserAvatar
              username={profile.username}
              firstName={profile.firstName}
              lastName={profile.lastName}
              avatar={profile.avatar}
              size={40}
              isOwn={isOwn}
            />
          </Link>
        ) : (
          <div style={{ width: 40, height: 40, flexShrink: 0 }} />
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
            <div>
              {profile ? (
                <Link href={`/${profile.username}`} style={{ textDecoration: "none" }}>
                  <AuthorName profile={profile} />
                </Link>
              ) : (
                <span style={{ fontSize: 14, color: "var(--t-md)" }}>Unknown</span>
              )}
            </div>
            <span style={{ fontSize: 12, color: "var(--t-lo)", whiteSpace: "nowrap", flexShrink: 0 }}>
              {relativeTime(createdAt)}
            </span>
          </div>

          <p
            style={{
              margin: "6px 0 0",
              fontSize: 15,
              lineHeight: 1.55,
              color: "var(--t-hi)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {content}
            {hashtags.length > 0 && (
              <>
                {" "}
                {hashtags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/explore?q=%23${tag}`}
                    style={{ color: "var(--accent-mid, var(--accent-a))", textDecoration: "none" }}
                  >
                    #{tag}
                  </Link>
                ))}
              </>
            )}
          </p>

          {imageUrl && (
            <div
              style={{
                position: "relative",
                width: "100%",
                height: 300,
                borderRadius: 12,
                overflow: "hidden",
                marginTop: 10,
                border: "1px solid var(--div)",
              }}
            >
              <Image
                src={imageUrl}
                alt="Post image"
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                style={{ objectFit: "cover" }}
              />
            </div>
          )}

          {quoteOf && <QuoteCard post={quoteOf} />}

          <PostActionBar
            postId={item.id}
            likesCount={item.likesCount}
            commentsCount={item.commentsCount}
            repostsCount={item.repostsCount}
            isLiked={item.isLiked}
            isReposted={item.isReposted}
            isBookmarked={item.isBookmarked}
          />
        </div>
      </div>
    </article>
  );
}
