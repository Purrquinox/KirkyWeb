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
        padding: "16px 0 24px",
        position: "sticky",
        top: 0,
        height: "100dvh",
        overflowY: "auto",
        borderLeft: "1px solid var(--div)",
      }}
    >
      <section style={{ padding: "0 16px" }}>
        <h2
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--t-lo)",
            margin: "0 0 12px",
          }}
        >
          Trending
        </h2>

        {hashtags.length === 0 ? (
          <p style={{ fontSize: 14, color: "var(--t-lo)", margin: 0 }}>No trends yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {hashtags.map((h, i) => (
              <Link
                key={h.tag}
                href={`/explore?q=%23${h.tag}`}
                style={{
                  display: "block",
                  padding: "10px 0",
                  borderBottom: i < hashtags.length - 1 ? "1px solid var(--div)" : "none",
                  textDecoration: "none",
                }}
              >
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--t-hi)",
                    letterSpacing: "-0.2px",
                  }}
                >
                  #{h.tag}
                </div>
                <div style={{ fontSize: 12, color: "var(--t-lo)", marginTop: 2 }}>
                  {h.postsCount.toLocaleString()} posts
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </aside>
  );
}
