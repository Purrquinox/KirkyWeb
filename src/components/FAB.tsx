"use client";

import { PlusIcon } from "./Icons";

interface FABProps {
  onClick?: () => void;
}

export default function FAB({ onClick }: FABProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Compose post"
      style={{
        width: 54,
        height: 54,
        borderRadius: 17,
        background: "var(--t-hi)",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--bg)",
        flexShrink: 0,
        transition: `transform ${160}ms var(--ease-spring), box-shadow ${160}ms var(--ease-spring)`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.06)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
      }}
      onMouseDown={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.96)";
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.06)";
      }}
    >
      <PlusIcon size={24} />
    </button>
  );
}
