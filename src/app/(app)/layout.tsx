"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import TopBar from "@/components/TopBar";
import TrendingPanel from "@/components/TrendingPanel";
import ComposeModal from "@/components/ComposeModal";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [composeOpen, setComposeOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
        }}
      >
        <span className="wordmark" style={{ opacity: 0.4, fontSize: 36 }}>kirky</span>
      </div>
    );
  }

  if (!user) return null;

  const profile = user.profile;

  return (
    <>
      <div
        style={{
          display: "flex",
          minHeight: "100dvh",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        {/* Desktop sidebar — hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar
            username={profile?.username}
            onCompose={() => setComposeOpen(true)}
          />
        </div>

        {/* Center column */}
        <main
          style={{
            flex: 1,
            minWidth: 0,
            borderLeft: "1px solid var(--div)",
            borderRight: "1px solid var(--div)",
          }}
        >
          {/* Mobile top bar */}
          <div className="lg:hidden">
            <TopBar user={user} />
          </div>

          {children}

          {/* Mobile tab bar bottom spacer */}
          <div className="lg:hidden" style={{ height: 96 }} />
        </main>

        {/* Right panel — only on wide screens */}
        <div className="hidden xl:block">
          <TrendingPanel />
        </div>
      </div>

      {/* Mobile floating tab bar */}
      <div className="lg:hidden">
        <TabBar username={profile?.username} />
      </div>

      {composeOpen && (
        <ComposeModal onClose={() => setComposeOpen(false)} />
      )}
    </>
  );
}
