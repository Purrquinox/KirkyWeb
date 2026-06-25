"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init(config: {
          clientId: string;
          scope: string;
          redirectURI: string;
          usePopup: boolean;
        }): void;
        signIn(): Promise<{
          authorization: { id_token: string; code: string; state?: string };
          user?: { name?: { firstName?: string; lastName?: string }; email?: string };
        }>;
      };
    };
  }
}

function loadAppleSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.AppleID) { resolve(); return; }
    const existing = document.querySelector('script[src*="appleid.auth.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Apple Sign In SDK"));
    document.head.appendChild(script);
  });
}

export function AppleSignInButton({
  onError,
}: {
  onError?: (msg: string) => void;
}) {
  const { loginWithApple } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      await loadAppleSDK();
      window.AppleID!.auth.init({
        clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID!,
        scope: "name email",
        redirectURI: window.location.origin + "/login",
        usePopup: true,
      });
      const result = await window.AppleID!.auth.signIn();
      await loginWithApple(result.authorization.id_token, result.user
        ? {
            firstName: result.user.name?.firstName,
            lastName: result.user.name?.lastName,
            email: result.user.email,
          }
        : undefined
      );
      router.replace("/home");
    } catch (err: unknown) {
      const asObj = err as Record<string, unknown> | null;
      if (asObj && asObj["error"] === "popup_closed_by_user") {
        // user dismissed — silent
      } else {
        onError?.(err instanceof Error ? err.message : "Apple sign in failed");
      }
    } finally {
      setLoading(false);
    }
  }, [loading, loginWithApple, router, onError]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      style={{
        width: "100%",
        padding: "13px 0",
        borderRadius: 999,
        border: "1px solid var(--div-strong)",
        background: loading ? "var(--bg-surface)" : "#fff",
        color: "#000",
        fontWeight: 600,
        fontSize: 15,
        fontFamily: "inherit",
        letterSpacing: "-0.01em",
        cursor: loading ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "opacity 200ms, background 200ms",
        opacity: loading ? 0.6 : 1,
      }}
    >
      {!loading && (
        <svg
          width="17"
          height="17"
          viewBox="0 0 814 1000"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.3-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.9 125.6-318.3 249.1-318.3 66.9 0 122.6 44.4 164.1 44.4 39.8 0 101.9-47.2 177.3-47.2 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
        </svg>
      )}
      {loading ? "Signing in..." : "Continue with Apple"}
    </button>
  );
}
