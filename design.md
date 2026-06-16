# Kirky — Design Language

## Philosophy

Kirky is built around a single conviction: creator-focused social apps should feel like they were designed by someone with taste, not assembled from a component kit. The visual language is **bold, editorial, and intentional** — dark surfaces, vivid accent colors, tight typography, and zero visual noise that doesn't earn its place.

---

## Color

The app is rooted in an almost-black background (`#0A080D` — a cool near-black with a faint purple undertone) rather than a flat neutral. This lets accent colors read more vividly and gives the UI a sense of depth without resorting to gradients everywhere.

**Accent colors** are user-selectable from a set of four gradient pairings:

| Palette | From | To |
|---|---|---|
| Violet → Blue | `#6633CC` | `#3380E5` |
| Rose → Amber | `#E54D66` | `#E59933` |
| Teal → Blue | `#1AB380` | `#1A66CC` |
| Fuchsia → Violet | `#CC33A3` | `#6619CC` |

The accent color isn't just decorative — it's wired into active states across every interactive component. One accent token, applied consistently everywhere.

**Semantic action colors** are fixed regardless of accent:
- **Like** → user accent (personal, expressive)
- **Repost** → `#22D599` vivid green (universal signal for amplification)
- **Bookmark** → `#738AFF` vivid blue (save/archive)

Inactive states use `white @ 22% opacity` — low enough to recede, high enough to remain discoverable.

---

## Typography

All text is set in **SF Pro**, leaning heavily on the `.black` weight for anything that needs presence.

| Element | Size | Weight | Tracking |
|---|---|---|---|
| Wordmark ("kirky") | 26pt | Black | −0.8 |
| Author names | 16pt | Black | −0.25 |
| Avatar initials | `size × 0.38` | Black | — |
| Action counts (active) | 13pt | Bold | — |
| Action counts (inactive) | 13pt | Regular | — |

The guiding principle: **hierarchy through weight, not size.** A 16pt Black name reads as a headline next to 14pt Regular body text without needing to be physically larger.

---

## Components

### TopBar

A minimal 52pt bar — wordmark left, avatar button right. The wordmark doubles as a navigation trigger (opens the sidebar). The avatar has an accent-colored ring and tinted background fill, so it's clearly interactive without needing a separate icon.

### CustomTabBar

A **floating pill** that sits above the home indicator — not a full-width edge bar. The dark frosted capsule lifts off the background, reducing visual weight at the bottom of the screen. Active tab: white icon at `.semibold` weight + a 20×3pt accent pill below it. Inactive: white at 28% opacity. Spring animations (`response: 0.25, damping: 0.75`) on tab switch.

### FAB (Compose Button)

A **squircle** (`RoundedRectangle(cornerRadius: 17)`) rather than a circle. White fill, dark icon — intentional inversion of the surrounding dark UI. Size: 54×54pt. The squircle shape is more contained and editorial than a circle; it reads as a button, not a badge.

### UserAvatar

Always has a ring. Own-post avatars get the accent color ring at 2.5pt; all others get `white @ 10%`. Initials fallback uses a palette derived from username hash — deterministic, so the same user always gets the same color.

### PostActionBar

Four actions in a horizontal row: like, comment, repost, bookmark. Each renders as an `ActionChip` — icon + optional count. Active states use vivid color + `.bold` count weight + a subtle `scaleEffect(1.05)`. All state changes use optimistic updates with rollback on API failure, and spring animations on every toggle.

### NotificationRow

Icon-first layout: a 44×44pt rounded square tile carries the notification type color (vivid, not muted). An unread badge dot sits in the top-trailing corner of the tile. No separate actor avatar — the type icon is the hero element.

### FormComponents & SettingsComponents

No container boxes. Rules only — hairline horizontal separators between items. Labels float and turn accent on focus. This removes one full layer of visual chrome from every form and settings surface.

---

## Motion

All interactions use `spring` animations, never `easeInOut`. Two presets cover most cases:

- **Snappy** — `response: 0.2, dampingFraction: 0.6` — for toggles (like, repost, bookmark)
- **Smooth** — `response: 0.25–0.3, dampingFraction: 0.7–0.75` — for tab switches, sidebar open/close

Spring physics gives the UI a physical quality — elements feel like they have mass rather than just transitioning between states on a timer.

---

## Design Principles Summary

1. **One accent token, everywhere** — no ad-hoc color choices inside components
2. **Weight over size** — hierarchy from `.black` SF Pro, not from font size escalation
3. **Always-visible rings** — avatars always have a ring; the ring carries meaning (accent = you, white = others)
4. **No decoration for decoration's sake** — every visible element either communicates state or creates hierarchy
5. **Floating, not anchored** — the tab bar floats; the FAB floats; components avoid edge-to-edge fills that make the UI feel heavy