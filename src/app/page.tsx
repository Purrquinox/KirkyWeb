"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/home");
    }
  }, [loading, user, router]);

  if (loading) return null;

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Hero */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle glow behind wordmark */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            width: 600,
            height: 300,
            background: "radial-gradient(ellipse, rgba(102,51,204,0.12) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -60%)",
            pointerEvents: "none",
          }}
        />

        {/* Wordmark */}
        <h1
          style={{
            fontWeight: 900,
            fontSize: "clamp(80px, 18vw, 200px)",
            letterSpacing: "-0.05em",
            color: "var(--t-hi)",
            lineHeight: 0.9,
            margin: "0 0 32px",
            textAlign: "center",
            userSelect: "none",
          }}
        >
          kirky
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontSize: "clamp(16px, 2vw, 22px)",
            color: "var(--t-md)",
            margin: "0 0 48px",
            textAlign: "center",
            fontWeight: 400,
            letterSpacing: "-0.01em",
            maxWidth: 340,
            lineHeight: 1.4,
          }}
        >
          The social network for people who actually make things.
        </p>

        {/* CTAs */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Link
            href="/signup"
            style={{
              padding: "13px 32px",
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
              color: "var(--t-hi)",
              background: "linear-gradient(135deg, var(--accent-a) 0%, var(--accent-b) 100%)",
              letterSpacing: "-0.01em",
            }}
          >
            Join Kirky
          </Link>
          <Link
            href="/login"
            style={{
              padding: "13px 32px",
              borderRadius: 999,
              fontWeight: 600,
              fontSize: 15,
              textDecoration: "none",
              color: "var(--t-md)",
              border: "1px solid var(--div-strong)",
              letterSpacing: "-0.01em",
            }}
          >
            Sign in
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: "20px 24px",
          textAlign: "center",
          fontSize: 12,
          color: "var(--t-ghost)",
          borderTop: "1px solid var(--div)",
        }}
      >
        © {new Date().getFullYear()} Kirky
      </footer>
    </div>
  );
}
