"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as api from "@/lib/api";

export default function TrendingPanel() {
  const [hashtags, setHashtags] = useState<api.Hashtag[]>([]);

  useEffect(() => {
    api.getTrendingHashtags({ limit: 8 })
      .then(({ hashtags }) => setHashtags(hashtags))
      .catch(() => {});
  }, []);

  return (
    <aside
      style={{
        width: 280,
        flexShrink: 0,
        padding: "20px 0 24px",
        position: "sticky",
        top: 0,
        height: "100dvh",
        overflowY: "auto",
        borderLeft: "1px solid var(--div)",
      }}
    >
      <section style={{ padding: "0 20px" }}>
        <h2
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--t-lo)",
            margin: "0 0 14px",
          }}
        >
          Trending now
        </h2>

        {hashtags.length === 0 ? (
          <p style={{ fontSize: 14, color: "var(--t-lo)", margin: 0 }}>No trends yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {hashtags.map((h, i) => (
              <Link
                key={h.tag}
                href={`/explore?q=%23${h.tag}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: i < hashtags.length - 1 ? "1px solid var(--div)" : "none",
                  textDecoration: "none",
                  transition: "opacity 120ms var(--ease-out)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--t-ghost)",
                    fontVariantNumeric: "tabular-nums",
                    width: 16,
                    flexShrink: 0,
                    textAlign: "right",
                    lineHeight: 1,
                  }}
                >
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--t-hi)",
                      letterSpacing: "-0.2px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    #{h.tag}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--t-lo)", marginTop: 2 }}>
                    {h.postsCount.toLocaleString()} posts
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </aside>
  );
}
