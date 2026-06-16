# Kirky — Web

The official web frontend for [Kirky](https://kirky.app), a social platform built around short-form posts, real-time discussion, and community discovery.

## What is Kirky?

Kirky is a social network where people share posts, follow each other, and engage with communities built around hashtags and events.

**Core experience**

- **Posts** — text posts with optional titles and images. Like, repost, quote, or bookmark any post.
- **Threads** — nested comment replies let conversations go as deep as they need to.
- **Feeds** — a Following feed (chronological, people you follow) and a For You feed (algorithmic discovery).
- **Quotes** — embed someone else's post inside your own, with your own commentary on top.

**Discovery**

- **Hashtags** — tag posts with `#topics`. Trending hashtags surface across 24h, 7d, and 30d windows.
- **Explore** — browse trending posts and hashtags, and see what's moving right now.
- **Events** — time-bounded moments tied to a hashtag, promoted on the Explore page.
- **Search** — find users, posts, and hashtags from a single query.

**People**

- **Profiles** — avatar, banner, bio, location, website, and a pinned post.
- **Verified accounts** — first-party badge surfaced across the UI.
- **Follow graph** — follow/unfollow with public follower and following counts.
- **Blocking** — block users to remove them from your feed and prevent interaction.

**Notifications**

- In-app notification feed covering follows, likes, comments, reposts, quotes, and @mentions.
- Real-time delivery via a server-sent events stream.
- Web Push notifications (VAPID) and iOS push for off-session alerts.

**Auth**

- Email + password with email verification and forgot-password flow.
- Sign in with Apple.
- Sign in with GitHub (OAuth).
- JWT access tokens with silent refresh — no page reloads on expiry.

## Design Language

Kirky's visual language is **bold, editorial, and intentional** — dark surfaces, vivid accent colors, tight typography, and nothing decorative that doesn't earn its place.

### Philosophy

Creator-focused social apps should feel like they were designed by someone with taste, not assembled from a component kit. Every visible element either communicates state or creates hierarchy. Nothing else.

Five principles govern every component decision:

1. **One accent token, everywhere** — no ad-hoc color choices inside components
2. **Weight over size** — hierarchy from heavy type weight, not from font size escalation
3. **Always-visible rings** — avatars always carry a ring; the ring carries meaning (accent = you, white/muted = others)
4. **No decoration for decoration's sake** — ornamentation that doesn't communicate state gets cut
5. **Floating, not anchored** — interactive chrome lifts off the background rather than anchoring edge-to-edge

### Color

The base background is `#0A080D` — an almost-black with a cool purple undertone. This makes accent colors read more vividly and gives surfaces depth without relying on gradients.

**Accent palettes** — user-selectable, four options:

| Name | From | To |
|---|---|---|
| Violet → Blue | `#6633CC` | `#3380E5` |
| Rose → Amber | `#E54D66` | `#E59933` |
| Teal → Blue | `#1AB380` | `#1A66CC` |
| Fuchsia → Violet | `#CC33A3` | `#6619CC` |

The chosen accent flows into every active state across every interactive component — one token, applied consistently.

**Semantic action colors** are fixed regardless of accent choice:

| Action | Color | Rationale |
|---|---|---|
| Like | User's accent | Personal and expressive |
| Repost | `#22D599` vivid green | Universal signal for amplification |
| Bookmark | `#738AFF` vivid blue | Save / archive |

Inactive states use `white @ 22% opacity` — low enough to recede, high enough to stay discoverable.

### Typography

All text is set in **SF Pro** (web: system-ui stack with Inter as the web equivalent), leaning heavily on Black weight for anything that needs presence.

| Element | Size | Weight | Tracking |
|---|---|---|---|
| Wordmark ("kirky") | 26pt | Black | −0.8 |
| Author names | 16pt | Black | −0.25 |
| Avatar initials | `size × 0.38` | Black | — |
| Action counts (active) | 13pt | Bold | — |
| Action counts (inactive) | 13pt | Regular | — |

Hierarchy comes from weight, not size. A 16pt Black name reads as a headline next to 14pt Regular body copy without needing to be physically larger.

### Components

**Post action bar** — four actions in a row: like, comment, repost, bookmark. Each renders as an icon + optional count chip. Active states use vivid color, bold count weight, and a subtle scale-up. All state changes are optimistic with rollback on API failure.

**User avatar** — always has a ring. Own-post avatars: accent-colored ring. All others: `white @ 10%`. Initials fallback color is derived from a username hash — deterministic, so the same user always gets the same color.

**Compose button (FAB)** — squircle shape, white fill, dark icon. Intentional inversion of the surrounding dark UI. The squircle reads as a button, not a badge.

**Notification rows** — icon-first layout: a rounded-square tile carries the notification type color (vivid, not muted). Unread badge dot in the top-trailing corner. No actor avatar — the type icon is the hero element.

**Forms and settings** — no container boxes. Hairline horizontal rules between items only. Labels lift and turn accent on focus. One full layer of visual chrome removed from every form surface.

### Motion

All transitions use spring physics, not easing curves. Two presets:

- **Snappy** (`response: 0.2, damping: 0.6`) — toggles: like, repost, bookmark
- **Smooth** (`response: 0.25–0.3, damping: 0.7–0.75`) — navigation, overlays, sidebar

Spring physics gives elements a sense of mass — they feel like they're responding to force, not running on a timer.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Styling | Tailwind CSS v4 |
| Language | TypeScript 5 |
| API | `https://api.kirky.app` / `https://auth.kirky.app` |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    layout.tsx       # Root layout
    page.tsx         # Home page
    globals.css      # Global styles
  lib/
    api.ts           # Typed API client for all Kirky endpoints
```

## API Client

`src/lib/api.ts` is a zero-dependency typed client that wraps both the API and Auth services. It handles:

- **Token management** — stores access/refresh tokens in memory and auto-refreshes on 401
- **Auth** — email/password, Apple Sign-In, GitHub OAuth, forgot-password
- **Feed** — Following feed and For You feed with pagination
- **Posts** — CRUD, likes, reposts, quotes, bookmarks, image uploads
- **Comments** — threaded replies, likes
- **Users** — public/private profiles, follow/unfollow, block/unblock
- **Search** — unified search across users, posts, and hashtags
- **Explore** — trending hashtags, trending posts, events (24h / 7d / 30d windows)
- **Notifications** — list, mark read, real-time SSE stream, Web Push (VAPID)

Usage:

```ts
import { login, setTokens, getForYouFeed } from "@/lib/api";

const { accessToken, refreshToken } = await login({ email, password });
setTokens(accessToken, refreshToken);

const { items } = await getForYouFeed({ limit: 20 });
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Notes

This project uses **Next.js 16**, which includes breaking changes from earlier versions. Before editing routing, data-fetching, or server component patterns, consult `node_modules/next/dist/docs/` for up-to-date conventions.
