"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { ChevronLeftIcon, ImageIcon } from "@/components/Icons";
import * as api from "@/lib/api";

function Field({
  label,
  value,
  onChange,
  placeholder,
  prefix,
  multiline,
  maxLength,
  last,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  prefix?: string;
  multiline?: boolean;
  maxLength?: number;
  last?: boolean;
}) {
  return (
    <div
      style={{
        padding: "12px 16px",
        borderBottom: last ? "none" : "1px solid var(--div)",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <label
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--t-lo)",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {label}
      </label>
      <div style={{ display: "flex", alignItems: multiline ? "flex-start" : "center", gap: 4 }}>
        {prefix && <span style={{ fontSize: 15, color: "var(--t-md)", lineHeight: "24px" }}>{prefix}</span>}
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={3}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "var(--t-hi)",
              fontSize: 15,
              fontFamily: "inherit",
              resize: "none",
              lineHeight: 1.5,
            }}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "var(--t-hi)",
              fontSize: 15,
              fontFamily: "inherit",
              minWidth: 0,
            }}
          />
        )}
        {multiline && maxLength && (
          <span
            style={{
              fontSize: 11,
              color: value.length > maxLength * 0.85 ? "var(--accent-a)" : "var(--t-lo)",
              alignSelf: "flex-end",
              flexShrink: 0,
            }}
          >
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      style={{
        width: 44,
        height: 26,
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        background: value
          ? "linear-gradient(135deg, var(--accent-a), var(--accent-b))"
          : "var(--bg-raised)",
        position: "relative",
        transition: "background 200ms var(--ease-out)",
        flexShrink: 0,
        padding: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: value ? "calc(100% - 23px)" : 3,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "white",
          transition: "left 200ms var(--ease-spring)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
        }}
      />
    </button>
  );
}

export default function ProfileSettingsPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const profile = user?.profile;

  const [firstName, setFirstName] = useState(profile?.firstName ?? "");
  const [lastName, setLastName]   = useState(profile?.lastName ?? "");
  const [username, setUsername]   = useState(profile?.username ?? "");
  const [bio, setBio]             = useState(profile?.bio ?? "");
  const [website, setWebsite]     = useState(profile?.website ?? "");
  const [location, setLocation]   = useState(profile?.location ?? "");
  const [emailPublic, setEmailPublic] = useState(profile?.emailPublic ?? false);

  const [avatarFile, setAvatarFile]       = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile]       = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await api.updateProfile({
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
        username: username.trim(),
        bio: bio.trim() || null,
        website: website.trim() || null,
        location: location.trim() || null,
        emailPublic,
        ...(avatarFile ? { avatarFile } : {}),
        ...(bannerFile ? { bannerImageFile: bannerFile } : {}),
      });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError((err as Error).message ?? "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }, [saving, firstName, lastName, username, bio, website, location, emailPublic, avatarFile, bannerFile, refreshUser]);

  const displayAvatar = avatarPreview ?? profile?.avatar ?? null;
  const displayBanner = bannerPreview ?? profile?.bannerImage ?? null;
  const initials = (profile?.firstName?.[0] ?? profile?.username?.[0] ?? "?").toUpperCase();

  return (
    <div>
      {/* Sticky header */}
      <div
        style={{
          height: 52,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 16px",
          borderBottom: "1px solid var(--div)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "var(--bg-overlay)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          style={{
            background: "none",
            border: "none",
            color: "var(--t-md)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: 4,
            borderRadius: 8,
          }}
        >
          <ChevronLeftIcon size={20} />
        </button>
        <span
          style={{
            fontWeight: 900,
            fontSize: 16,
            letterSpacing: "-0.25px",
            color: "var(--t-hi)",
            flex: 1,
          }}
        >
          Edit profile
        </span>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "7px 18px",
            borderRadius: 999,
            background: saved
              ? "rgba(34,213,153,0.15)"
              : "linear-gradient(135deg, var(--accent-a), var(--accent-b))",
            border: saved ? "1px solid var(--c-repost)" : "none",
            color: saved ? "var(--c-repost)" : "white",
            fontSize: 14,
            fontWeight: 700,
            cursor: saving ? "default" : "pointer",
            fontFamily: "inherit",
            opacity: saving ? 0.6 : 1,
            transition: "opacity 200ms, background 200ms, color 200ms",
          }}
        >
          {saving ? "Saving…" : saved ? "Saved" : "Save"}
        </button>
      </div>

      {/* Banner */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Change banner photo"
        onClick={() => bannerInputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && bannerInputRef.current?.click()}
        style={{
          position: "relative",
          height: 120,
          background: "linear-gradient(135deg, var(--accent-a), var(--accent-b))",
          overflow: "hidden",
          cursor: "pointer",
        }}
      >
        {displayBanner && (
          <Image
            src={displayBanner}
            alt=""
            fill
            sizes="700px"
            style={{ objectFit: "cover" }}
            unoptimized={!!bannerPreview}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.28)",
            color: "white",
          }}
        >
          <ImageIcon size={22} />
        </div>
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleBannerChange}
        />
      </div>

      {/* Body */}
      <div style={{ padding: "0 16px 48px", position: "relative" }}>
        {/* Avatar */}
        <div style={{ marginTop: -28, marginBottom: 20 }}>
          <button
            onClick={() => avatarInputRef.current?.click()}
            aria-label="Change avatar"
            style={{
              border: "3px solid var(--bg)",
              borderRadius: "50%",
              background: "none",
              padding: 0,
              cursor: "pointer",
              position: "relative",
              display: "inline-block",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                overflow: "hidden",
                background: "var(--bg-surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {displayAvatar ? (
                <Image
                  src={displayAvatar}
                  alt="Avatar"
                  width={72}
                  height={72}
                  style={{ objectFit: "cover", borderRadius: "50%" }}
                  unoptimized={!!avatarPreview}
                />
              ) : (
                <span style={{ fontSize: 26, fontWeight: 900, color: "var(--t-hi)" }}>
                  {initials}
                </span>
              )}
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent-a), var(--accent-b))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid var(--bg)",
                color: "white",
              }}
            >
              <ImageIcon size={11} />
            </div>
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
        </div>

        {/* Error */}
        {error && (
          <p
            style={{
              color: "#FF5050",
              fontSize: 13,
              margin: "0 0 16px",
              padding: "10px 14px",
              background: "rgba(255,80,80,0.08)",
              borderRadius: 10,
              border: "1px solid rgba(255,80,80,0.2)",
            }}
          >
            {error}
          </p>
        )}

        {/* Fields */}
        <div
          style={{
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid var(--div)",
            background: "var(--bg-surface)",
          }}
        >
          <Field label="First name" value={firstName} onChange={setFirstName} placeholder="First name" />
          <Field label="Last name"  value={lastName}  onChange={setLastName}  placeholder="Last name" />
          <Field label="Username"   value={username}  onChange={setUsername}  placeholder="username" prefix="@" />
          <Field label="Bio"        value={bio}       onChange={setBio}       placeholder="Tell people about yourself" multiline maxLength={160} />
          <Field label="Website"    value={website}   onChange={setWebsite}   placeholder="https://" />
          <Field label="Location"   value={location}  onChange={setLocation}  placeholder="City, Country" last />
        </div>

        {/* Email public toggle */}
        <div
          style={{
            marginTop: 12,
            padding: "14px 16px",
            borderRadius: 14,
            border: "1px solid var(--div)",
            background: "var(--bg-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "var(--t-hi)" }}>
              Show email publicly
            </div>
            <div style={{ fontSize: 13, color: "var(--t-md)", marginTop: 2 }}>
              Others can see your email on your profile
            </div>
          </div>
          <Toggle value={emailPublic} onChange={setEmailPublic} />
        </div>
      </div>
    </div>
  );
}
