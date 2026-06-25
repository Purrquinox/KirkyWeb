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
        className="shimmer"
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <div className="shimmer" style={{ width: 110, height: 12 }} />
          <div className="shimmer" style={{ width: 72, height: 12 }} />
        </div>
        <div className="shimmer" style={{ width: "100%", height: 12 }} />
        <div className="shimmer" style={{ width: "82%", height: 12 }} />
        <div className="shimmer" style={{ width: "58%", height: 12 }} />
      </div>
    </div>
  );
}
