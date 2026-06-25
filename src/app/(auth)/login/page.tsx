"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { AppleSignInButton } from "@/components/AppleSignInButton";

function FloatingField({
  id,
  label,
  type,
  value,
  onChange,
  autoComplete,
  error,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div style={{ position: "relative", paddingTop: 18 }}>
      <label
        htmlFor={id}
        style={{
          position: "absolute",
          left: 0,
          top: lifted ? 0 : 28,
          fontSize: lifted ? 11 : 15,
          fontWeight: lifted ? 600 : 400,
          color: focused ? "var(--accent-a)" : "var(--t-md)",
          transition: "all 160ms var(--ease-out)",
          pointerEvents: "none",
          letterSpacing: lifted ? "0.04em" : "0",
          textTransform: lifted ? "uppercase" : "none",
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          borderBottom: `1px solid ${focused ? "var(--accent-a)" : "var(--div-strong)"}`,
          outline: "none",
          color: "var(--t-hi)",
          fontSize: 16,
          padding: "8px 0",
          fontFamily: "inherit",
          transition: "border-color 160ms var(--ease-out)",
        }}
      />
      {error && (
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#E54D66" }}>{error}</p>
      )}
    </div>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  const submit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
      setLoading(false);
    }
  }, [email, password, login, router, loading]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        {/* Wordmark */}
        <Link href="/" style={{ textDecoration: "none", display: "block", marginBottom: 48, textAlign: "center" }}>
          <span className="wordmark" style={{ fontSize: 32 }}>kirky</span>
        </Link>

        <h1
          style={{
            fontWeight: 900,
            fontSize: 26,
            letterSpacing: "-0.5px",
            margin: "0 0 8px",
            color: "var(--t-hi)",
          }}
        >
          Sign in
        </h1>
        <p style={{ fontSize: 15, color: "var(--t-md)", margin: "0 0 40px" }}>
          Welcome back.
        </p>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <FloatingField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
          />
          <FloatingField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />

          {error && (
            <p
              style={{
                margin: 0,
                padding: "10px 14px",
                borderRadius: 10,
                background: "rgba(229,77,102,0.10)",
                border: "1px solid rgba(229,77,102,0.25)",
                fontSize: 13,
                color: "#E54D66",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!email || !password || loading}
            style={{
              marginTop: 8,
              padding: "14px 0",
              borderRadius: 999,
              border: "none",
              cursor: email && password && !loading ? "pointer" : "not-allowed",
              background:
                email && password && !loading
                  ? "linear-gradient(135deg, var(--accent-a), var(--accent-b))"
                  : "var(--bg-surface)",
              color: "var(--t-hi)",
              fontWeight: 700,
              fontSize: 15,
              fontFamily: "inherit",
              letterSpacing: "-0.01em",
              transition: "background 200ms var(--ease-out), opacity 200ms",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: "var(--div)" }} />
            <span style={{ fontSize: 12, color: "var(--t-lo)", letterSpacing: "0.04em", textTransform: "uppercase" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--div)" }} />
          </div>
          <AppleSignInButton onError={setError} />
        </div>

        <div
          style={{
            marginTop: 32,
            paddingTop: 24,
            borderTop: "1px solid var(--div)",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: 14, color: "var(--t-md)" }}>
            New to Kirky?{" "}
            <Link
              href="/signup"
              style={{
                color: "var(--accent-a)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Join Kirky
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
