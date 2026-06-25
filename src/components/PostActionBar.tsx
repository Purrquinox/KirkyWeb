"use client";

import { useState, useCallback } from "react";
import {
  HeartIcon, HeartFilledIcon,
  CommentIcon, RepeatIcon, BookmarkIcon, BookmarkFilledIcon,
} from "./Icons";
import * as api from "@/lib/api";

interface PostActionBarProps {
  postId: string;
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  isLiked: boolean;
  isReposted: boolean;
  isBookmarked: boolean;
  onComment?: () => void;
}

function ActionChip({
  icon,
  activeIcon,
  count,
  active,
  activeColor,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  count: number;
  active: boolean;
  activeColor: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "4px 6px",
        borderRadius: 8,
        color: active ? activeColor : "var(--t-lo)",
        transform: active ? "scale(1.05)" : "scale(1)",
        transition: `color ${160}ms var(--ease-spring), transform ${160}ms var(--ease-spring)`,
      }}
    >
      <span style={{ display: "flex", transition: `transform ${160}ms var(--ease-spring)` }}>
        {active && activeIcon ? activeIcon : icon}
      </span>
      {count > 0 && (
        <span
          style={{
            fontSize: 13,
            fontWeight: active ? 700 : 400,
            lineHeight: 1,
            letterSpacing: active ? "-0.01em" : "0",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export default function PostActionBar({
  postId,
  likesCount: initialLikes,
  commentsCount,
  repostsCount: initialReposts,
  isLiked: initialLiked,
  isReposted: initialReposted,
  isBookmarked: initialBookmarked,
  onComment,
}: PostActionBarProps) {
  const [liked,     setLiked]     = useState(initialLiked);
  const [reposted,  setReposted]  = useState(initialReposted);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [likes,     setLikes]     = useState(initialLikes);
  const [reposts,   setReposts]   = useState(initialReposts);

  const handleLike = useCallback(async () => {
    const next = !liked;
    setLiked(next);
    setLikes((c) => c + (next ? 1 : -1));
    try {
      await (next ? api.likePost(postId) : api.unlikePost(postId));
    } catch {
      setLiked(!next);
      setLikes((c) => c + (next ? -1 : 1));
    }
  }, [liked, postId]);

  const handleRepost = useCallback(async () => {
    const next = !reposted;
    setReposted(next);
    setReposts((c) => c + (next ? 1 : -1));
    try {
      await (next ? api.repost(postId) : api.removeRepost(postId));
    } catch {
      setReposted(!next);
      setReposts((c) => c + (next ? -1 : 1));
    }
  }, [reposted, postId]);

  const handleBookmark = useCallback(async () => {
    const next = !bookmarked;
    setBookmarked(next);
    try {
      await (next ? api.bookmarkPost(postId) : api.removeBookmark(postId));
    } catch {
      setBookmarked(!next);
    }
  }, [bookmarked, postId]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        marginTop: 8,
      }}
    >
      <ActionChip
        icon={<HeartIcon size={18} />}
        activeIcon={<HeartFilledIcon size={18} />}
        count={likes}
        active={liked}
        activeColor="var(--accent-a)"
        label={liked ? "Unlike" : "Like"}
        onClick={handleLike}
      />
      <ActionChip
        icon={<CommentIcon size={18} />}
        count={commentsCount}
        active={false}
        activeColor="var(--t-hi)"
        label="Comment"
        onClick={() => onComment?.()}
      />
      <ActionChip
        icon={<RepeatIcon size={18} />}
        count={reposts}
        active={reposted}
        activeColor="var(--c-repost)"
        label={reposted ? "Remove repost" : "Repost"}
        onClick={handleRepost}
      />
      <ActionChip
        icon={<BookmarkIcon size={18} />}
        activeIcon={<BookmarkFilledIcon size={18} />}
        count={0}
        active={bookmarked}
        activeColor="var(--c-bookmark)"
        label={bookmarked ? "Remove bookmark" : "Bookmark"}
        onClick={handleBookmark}
      />
    </div>
  );
}
