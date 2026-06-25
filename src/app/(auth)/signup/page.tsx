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
  hint,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  hint?: string;
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
      {hint && focused && (
        <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--t-lo)" }}>{hint}</p>
      )}
    </div>
  );
}

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  const valid = email.trim() && username.trim() && password.length >= 8;

  const submit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || loading) return;
    setError(null);
    setLoading(true);
    try {
      await signup(email.trim(), password, username.trim().toLowerCase());
      router.replace("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }, [email, username, password, signup, router, valid, loading]);

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
          Join Kirky
        </h1>
        <p style={{ fontSize: 15, color: "var(--t-md)", margin: "0 0 40px" }}>
          Create your account.
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
            id="username"
            label="Username"
            type="text"
            value={username}
            onChange={setUsername}
            autoComplete="username"
            hint="Lowercase letters, numbers, and underscores only"
          />
          <FloatingField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            hint="At least 8 characters"
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
            disabled={!valid || loading}
            style={{
              marginTop: 8,
              padding: "14px 0",
              borderRadius: 999,
              border: "none",
              cursor: valid && !loading ? "pointer" : "not-allowed",
              background:
                valid && !loading
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
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p style={{ fontSize: 11, color: "var(--t-lo)", margin: "16px 0 0", lineHeight: 1.5 }}>
          By creating an account you agree to our terms of service.
        </p>

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
            marginTop: 28,
            paddingTop: 24,
            borderTop: "1px solid var(--div)",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: 14, color: "var(--t-md)" }}>
            Already have an account?{" "}
            <Link
              href="/login"
              style={{ color: "var(--accent-a)", textDecoration: "none", fontWeight: 600 }}
            >
              Sign in
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
