export default function PostSkeleton() {
  return (
    <div
      style={{
        borderBottom: "1px solid var(--div)",
        padding: "14px 16px",
        display: "flex",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "var(--bg-surface)",
          flexShrink: 0,
          animation: "pulse 1.6s ease-in-out infinite",
        }}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 100, height: 12, borderRadius: 6, background: "var(--bg-surface)", animation: "pulse 1.6s ease-in-out infinite" }} />
          <div style={{ width: 70, height: 12, borderRadius: 6, background: "var(--bg-surface)", animation: "pulse 1.6s 0.1s ease-in-out infinite" }} />
        </div>
        <div style={{ width: "100%", height: 12, borderRadius: 6, background: "var(--bg-surface)", animation: "pulse 1.6s 0.15s ease-in-out infinite" }} />
        <div style={{ width: "80%", height: 12, borderRadius: 6, background: "var(--bg-surface)", animation: "pulse 1.6s 0.2s ease-in-out infinite" }} />
        <div style={{ width: "55%", height: 12, borderRadius: 6, background: "var(--bg-surface)", animation: "pulse 1.6s 0.25s ease-in-out infinite" }} />
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
