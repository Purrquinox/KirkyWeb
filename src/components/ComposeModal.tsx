"use client";

import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import UserAvatar from "./UserAvatar";
import { ImageIcon } from "./Icons";
import * as api from "@/lib/api";

interface ComposeModalProps {
  onClose: () => void;
  onPosted?: () => void;
}

export default function ComposeModal({ onClose, onPosted }: ComposeModalProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const profile = user?.profile;

  const handleFile = (file: File) => {
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const submit = useCallback(async () => {
    if (!content.trim() || posting) return;
    setPosting(true);
    setError(null);
    try {
      await api.createPost({
        content: content.trim(),
        ...(imageFile ? { imageFile } : {}),
        published: true,
      });
      onPosted?.();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to post");
      setPosting(false);
    }
  }, [content, imageFile, posting, onPosted, onClose]);

  const remaining = 500 - content.length;

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: 60,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-raised)",
          border: "1px solid var(--div-strong)",
          borderRadius: 20,
          width: "100%",
          maxWidth: 560,
          margin: "0 16px",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            borderBottom: "1px solid var(--div)",
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--t-md)",
              fontSize: 14,
              cursor: "pointer",
              padding: "4px 0",
            }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!content.trim() || posting || remaining < 0}
            style={{
              padding: "7px 18px",
              borderRadius: 999,
              border: "none",
              cursor: content.trim() && !posting && remaining >= 0 ? "pointer" : "not-allowed",
              background:
                content.trim() && !posting && remaining >= 0
                  ? "linear-gradient(135deg, var(--accent-a), var(--accent-b))"
                  : "var(--bg-surface)",
              color: "var(--t-hi)",
              fontWeight: 700,
              fontSize: 14,
              transition: `background ${160}ms var(--ease-out), opacity ${160}ms`,
              opacity: posting ? 0.6 : 1,
            }}
          >
            {posting ? "Posting..." : "Post"}
          </button>
        </div>

        {/* Body */}
        <div style={{ display: "flex", gap: 12, padding: 16 }}>
          {profile && (
            <UserAvatar
              username={profile.username}
              firstName={profile.firstName}
              lastName={profile.lastName}
              avatar={profile.avatar}
              size={40}
              isOwn
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <textarea
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                outline: "none",
                color: "var(--t-hi)",
                fontSize: 16,
                lineHeight: 1.55,
                resize: "none",
                fontFamily: "inherit",
              }}
            />

            {imagePreview && (
              <div style={{ position: "relative", marginTop: 8 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: "100%", maxHeight: 280, objectFit: "cover", borderRadius: 12 }}
                />
                <button
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.6)",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    fontSize: 16,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <p style={{ margin: 0, padding: "0 16px 12px", fontSize: 13, color: "#E54D66" }}>{error}</p>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 16px",
            borderTop: "1px solid var(--div)",
          }}
        >
          <button
            onClick={() => fileRef.current?.click()}
            aria-label="Attach image"
            style={{
              background: "none",
              border: "none",
              color: "var(--t-lo)",
              cursor: "pointer",
              padding: 4,
              display: "flex",
            }}
          >
            <ImageIcon size={20} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <span
            style={{
              fontSize: 13,
              color: remaining < 20 ? (remaining < 0 ? "#E54D66" : "#E59933") : "var(--t-lo)",
            }}
          >
            {remaining}
          </span>
        </div>
      </div>
    </div>
  );
}
