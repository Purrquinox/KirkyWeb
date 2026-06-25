// ─── Base URLs ───────────────────────────────────────────────────────────────

const API_BASE = "https://api.kirky.app";
const AUTH_BASE = "https://auth.kirky.app";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Author {
  profile: {
    username: string;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
    verified: boolean;
  } | null;
}

export interface ProfileSummary {
  username: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  verified: boolean;
}

export interface PublicProfile {
  username: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  bannerImage: string | null;
  verified: boolean;
  emailPublic: boolean;
  email: string | null;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isBlocked: boolean;
  pinnedPost: Post | null;
}

export interface PrivateProfile {
  id: string;
  userId: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  bannerImage: string | null;
  verified: boolean;
  emailPublic: boolean;
  createdAt: string;
  updatedAt: string;
  followersCount: number;
  followingCount: number;
}

export interface PrivateUser {
  id: string;
  email: string | null;
  isActive: boolean;
  emailVerified: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  profile: PrivateProfile | null;
}

export interface QuotePost {
  id: string;
  title: string | null;
  content: string;
  imageUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  author: Author;
}

export interface Post {
  id: string;
  title: string | null;
  content: string;
  imageUrl: string | null;
  published?: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: Author;
  quoteOf: QuotePost | null;
  likesCount: number;
  repostsCount: number;
  commentsCount: number;
  isLiked: boolean;
  isReposted: boolean;
  isBookmarked: boolean;
  hashtags: string[];
}

export interface FeedItem extends Post {
  type: "post" | "repost";
  repostedBy: ProfileSummary | null;
  repostedAt: string | null;
}

export interface Comment {
  id: string;
  content: string;
  imageUrl: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  author: Author;
  likesCount: number;
  isLiked: boolean;
  replies?: Omit<Comment, "replies">[];
}

export type NotificationType =
  | "FOLLOW"
  | "LIKE_POST"
  | "LIKE_COMMENT"
  | "COMMENT"
  | "REPOST"
  | "QUOTE"
  | "MENTION";

export interface Notification {
  id: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  actor: { profile: ProfileSummary | null };
  post: { id: string; content: string; title: string | null } | null;
  comment: { id: string; content: string } | null;
}

export interface Hashtag {
  tag: string;
  postsCount: number;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  featured: boolean;
  hashtag: { tag: string } | null;
  startsAt: string;
  endsAt: string | null;
  createdAt: string;
}

export interface AuthResult {
  message: string;
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
  };
  accessToken: string;
  refreshToken: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

// ─── Token management ─────────────────────────────────────────────────────────

let _accessToken: string | null = null;
let _refreshToken: string | null = null;
let _pendingRefresh: Promise<string> | null = null;

export function setTokens(accessToken: string, refreshToken: string): void {
  _accessToken = accessToken;
  _refreshToken = refreshToken;
}

export function clearTokens(): void {
  _accessToken = null;
  _refreshToken = null;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

// ─── Core request helper ──────────────────────────────────────────────────────

interface RequestOptions {
  method?: string;
  body?: Record<string, unknown> | FormData;
  auth?: boolean;
  baseUrl?: string;
}

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, auth = true, baseUrl = API_BASE } = options;

  const headers: Record<string, string> = {};

  if (auth && _accessToken) {
    headers["Authorization"] = `Bearer ${_accessToken}`;
  }

  let bodyPayload: BodyInit | undefined;
  if (body instanceof FormData) {
    bodyPayload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    bodyPayload = JSON.stringify(body);
  }

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: bodyPayload,
  });

  if (res.status === 401 && auth && _refreshToken && !_pendingRefresh) {
    _pendingRefresh = refreshToken()
      .then((r) => {
        _accessToken = r.accessToken;
        return r.accessToken;
      })
      .finally(() => {
        _pendingRefresh = null;
      });
  }

  if (res.status === 401 && auth && _pendingRefresh) {
    await _pendingRefresh;
    return request<T>(path, options);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw Object.assign(new Error(err.error ?? res.statusText), {
      status: res.status,
    });
  }

  return res.json() as Promise<T>;
}

// ─── Authentication ───────────────────────────────────────────────────────────

export async function signup(params: {
  email: string;
  password: string;
  username: string;
}): Promise<AuthResult & { requiresEmailVerification: boolean }> {
  return request("/api/auth/signup", {
    method: "POST",
    body: params,
    auth: false,
    baseUrl: AUTH_BASE,
  });
}

export async function login(params: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  return request("/api/auth/login", {
    method: "POST",
    body: params,
    auth: false,
    baseUrl: AUTH_BASE,
  });
}

export async function loginWithApple(params: {
  identityToken: string;
  user?: { firstName?: string; lastName?: string; email?: string };
}): Promise<AuthResult & { isNewUser: boolean }> {
  return request("/api/auth/apple", {
    method: "POST",
    body: params as Record<string, unknown>,
    auth: false,
    baseUrl: AUTH_BASE,
  });
}

export async function getGithubAuthorizeUrl(): Promise<{
  url: string;
  state: string;
}> {
  return request("/api/auth/github/authorize", { auth: false, baseUrl: AUTH_BASE });
}

export async function loginWithGithub(params: {
  code: string;
  state: string;
}): Promise<AuthResult & { isNewUser: boolean }> {
  return request("/api/auth/github/callback", {
    method: "POST",
    body: params,
    auth: false,
    baseUrl: AUTH_BASE,
  });
}

export async function refreshToken(): Promise<{ accessToken: string }> {
  if (!_refreshToken) throw new Error("No refresh token available");
  return request("/api/auth/refresh", {
    method: "POST",
    body: { refreshToken: _refreshToken },
    auth: false,
    baseUrl: AUTH_BASE,
  });
}

export async function logout(): Promise<{ message: string }> {
  if (!_refreshToken) throw new Error("No refresh token available");
  const res = await request<{ message: string }>("/api/auth/logout", {
    method: "POST",
    body: { refreshToken: _refreshToken },
    auth: false,
    baseUrl: AUTH_BASE,
  });
  clearTokens();
  return res;
}

export async function forgotPassword(params: {
  email: string;
}): Promise<{ message: string }> {
  return request("/api/auth/forgot-password", {
    method: "POST",
    body: params,
    auth: false,
    baseUrl: AUTH_BASE,
  });
}

// ─── System ───────────────────────────────────────────────────────────────────

export async function getApiStatus(): Promise<{ message: string }> {
  return request("/", { auth: false });
}

export async function getHealth(): Promise<{ status: string }> {
  return request("/health", { auth: false });
}

// ─── Feed ─────────────────────────────────────────────────────────────────────

export async function getFollowingFeed(
  params: PaginationParams = {}
): Promise<{ items: FeedItem[]; hasMore: boolean }> {
  const q = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  return request(`/feed${q ? `?${q}` : ""}`);
}

export async function getForYouFeed(
  params: PaginationParams = {}
): Promise<{ items: Post[]; hasMore: boolean }> {
  const q = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  return request(`/feed/for-you${q ? `?${q}` : ""}`);
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getMe(): Promise<{ user: PrivateUser }> {
  return request("/users/me");
}

export async function updateProfile(params: {
  username?: string;
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  website?: string | null;
  location?: string | null;
  avatar?: string | null;
  avatarFile?: File | Blob;
  bannerImage?: string | null;
  bannerImageFile?: File | Blob;
  emailPublic?: boolean;
  pinnedPostId?: string | null;
}): Promise<{ profile: PrivateProfile & { followersCount: number; followingCount: number; updatedAt: string } }> {
  const { avatarFile, bannerImageFile, ...rest } = params;

  if (avatarFile || bannerImageFile) {
    const form = new FormData();
    if (avatarFile) form.append("avatarFile", avatarFile);
    if (bannerImageFile) form.append("bannerImageFile", bannerImageFile);
    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined) form.append(k, v === null ? "" : String(v));
    }
    return request("/users/me", { method: "PATCH", body: form });
  }

  return request("/users/me", {
    method: "PATCH",
    body: rest as Record<string, unknown>,
  });
}

export async function getProfile(
  username: string
): Promise<{ profile: PublicProfile }> {
  return request(`/users/${username}`);
}

export async function followUser(
  username: string
): Promise<{ message: string }> {
  return request(`/users/${username}/follow`, { method: "POST" });
}

export async function unfollowUser(
  username: string
): Promise<{ message: string }> {
  return request(`/users/${username}/follow`, { method: "DELETE" });
}

export async function blockUser(
  username: string
): Promise<{ message: string }> {
  return request(`/users/${username}/block`, { method: "POST" });
}

export async function unblockUser(
  username: string
): Promise<{ message: string }> {
  return request(`/users/${username}/block`, { method: "DELETE" });
}

export async function getBlockedUsers(
  params: PaginationParams = {}
): Promise<{ profiles: ProfileSummary[]; total: number }> {
  const q = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  return request(`/users/blocks${q ? `?${q}` : ""}`);
}

export async function getFollowers(
  username: string,
  params: PaginationParams = {}
): Promise<{ profiles: ProfileSummary[]; total: number }> {
  const q = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  return request(`/users/${username}/followers${q ? `?${q}` : ""}`);
}

export async function getFollowing(
  username: string,
  params: PaginationParams = {}
): Promise<{ profiles: ProfileSummary[]; total: number }> {
  const q = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  return request(`/users/${username}/following${q ? `?${q}` : ""}`);
}

export async function getUserPosts(
  username: string,
  params: PaginationParams = {}
): Promise<{ posts: Post[]; total: number }> {
  const q = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  return request(`/users/${username}/posts${q ? `?${q}` : ""}`);
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export async function listPosts(
  params: PaginationParams = {}
): Promise<{ posts: Post[]; total: number }> {
  const q = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  return request(`/posts${q ? `?${q}` : ""}`);
}

export async function listMyPosts(
  params: PaginationParams = {}
): Promise<{ posts: Post[]; total: number }> {
  const q = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  return request(`/posts/mine${q ? `?${q}` : ""}`);
}

export async function listBookmarks(
  params: PaginationParams = {}
): Promise<{ posts: Post[]; total: number }> {
  const q = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  return request(`/posts/bookmarks${q ? `?${q}` : ""}`);
}

export async function getPost(id: string): Promise<{ post: Post }> {
  return request(`/posts/${id}`);
}

export async function createPost(params: {
  content: string;
  title?: string;
  imageUrl?: string;
  imageFile?: File | Blob;
  published?: boolean;
  quoteOfId?: string;
}): Promise<{ post: Post }> {
  const { imageFile, ...rest } = params;

  if (imageFile) {
    const form = new FormData();
    form.append("imageFile", imageFile);
    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined) form.append(k, String(v));
    }
    return request("/posts", { method: "POST", body: form });
  }

  return request("/posts", {
    method: "POST",
    body: rest as Record<string, unknown>,
  });
}

export async function updatePost(
  id: string,
  params: {
    content?: string;
    title?: string | null;
    imageUrl?: string | null;
    imageFile?: File | Blob;
    published?: boolean;
  }
): Promise<{ post: Post }> {
  const { imageFile, ...rest } = params;

  if (imageFile) {
    const form = new FormData();
    form.append("imageFile", imageFile);
    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined) form.append(k, v === null ? "" : String(v));
    }
    return request(`/posts/${id}`, { method: "PATCH", body: form });
  }

  return request(`/posts/${id}`, {
    method: "PATCH",
    body: rest as Record<string, unknown>,
  });
}

export async function deletePost(id: string): Promise<{ message: string }> {
  return request(`/posts/${id}`, { method: "DELETE" });
}

export async function likePost(id: string): Promise<{ message: string }> {
  return request(`/posts/${id}/like`, { method: "POST" });
}

export async function unlikePost(id: string): Promise<{ message: string }> {
  return request(`/posts/${id}/like`, { method: "DELETE" });
}

export async function repost(id: string): Promise<{ message: string }> {
  return request(`/posts/${id}/repost`, { method: "POST" });
}

export async function removeRepost(id: string): Promise<{ message: string }> {
  return request(`/posts/${id}/repost`, { method: "DELETE" });
}

export async function bookmarkPost(id: string): Promise<{ message: string }> {
  return request(`/posts/${id}/bookmark`, { method: "POST" });
}

export async function removeBookmark(id: string): Promise<{ message: string }> {
  return request(`/posts/${id}/bookmark`, { method: "DELETE" });
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function listComments(
  postId: string,
  params: PaginationParams = {}
): Promise<{ comments: Comment[] }> {
  const q = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  return request(`/posts/${postId}/comments${q ? `?${q}` : ""}`);
}

export async function createComment(
  postId: string,
  params: {
    content: string;
    imageUrl?: string;
    imageFile?: File | Blob;
    parentId?: string;
  }
): Promise<{ comment: Comment }> {
  const { imageFile, ...rest } = params;

  if (imageFile) {
    const form = new FormData();
    form.append("imageFile", imageFile);
    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined) form.append(k, String(v));
    }
    return request(`/posts/${postId}/comments`, { method: "POST", body: form });
  }

  return request(`/posts/${postId}/comments`, {
    method: "POST",
    body: rest as Record<string, unknown>,
  });
}

export async function updateComment(
  id: string,
  params: { content: string }
): Promise<{ comment: Comment }> {
  return request(`/comments/${id}`, { method: "PATCH", body: params });
}

export async function deleteComment(id: string): Promise<{ message: string }> {
  return request(`/comments/${id}`, { method: "DELETE" });
}

export async function likeComment(id: string): Promise<{ message: string }> {
  return request(`/comments/${id}/like`, { method: "POST" });
}

export async function unlikeComment(id: string): Promise<{ message: string }> {
  return request(`/comments/${id}/like`, { method: "DELETE" });
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function listNotifications(
  params: PaginationParams = {}
): Promise<{ notifications: Notification[]; total: number }> {
  const q = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  return request(`/notifications${q ? `?${q}` : ""}`);
}

export async function getUnreadCount(): Promise<{ count: number }> {
  return request("/notifications/unread-count");
}

export async function markAllNotificationsRead(): Promise<{ message: string }> {
  return request("/notifications/read-all", { method: "PATCH" });
}

export async function markNotificationRead(
  id: string
): Promise<{ message: string }> {
  return request(`/notifications/${id}/read`, { method: "PATCH" });
}

export function openNotificationStream(
  onNotification: (data: {
    id: string;
    type: NotificationType;
    createdAt: string;
    actor: string;
  }) => void
): EventSource {
  const es = new EventSource(
    `${API_BASE}/notifications/stream?token=${_accessToken}`
  );
  es.addEventListener("notification", (e) => {
    onNotification(JSON.parse((e as MessageEvent).data));
  });
  return es;
}

export async function getVapidPublicKey(): Promise<{ publicKey: string }> {
  return request("/notifications/vapid-public-key", { auth: false });
}

export async function registerPushDevice(
  params:
    | { platform: "IOS"; token: string }
    | { platform: "WEB"; token: string; p256dh: string; auth: string }
): Promise<{ message: string }> {
  return request("/notifications/push/register", {
    method: "POST",
    body: params as Record<string, unknown>,
  });
}

export async function unregisterPushDevice(params: {
  token: string;
}): Promise<{ message: string }> {
  return request("/notifications/push/unregister", {
    method: "DELETE",
    body: params,
  });
}

// ─── Search ───────────────────────────────────────────────────────────────────

export async function searchAll(params: {
  q: string;
  types?: string;
  limit?: number;
}): Promise<{
  query: string;
  users: PublicProfile[];
  posts: Post[];
  hashtags: Hashtag[];
}> {
  const q = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  return request(`/search/all?${q}`);
}

export async function searchUsers(params: {
  q: string;
  limit?: number;
  offset?: number;
}): Promise<{ profiles: PublicProfile[]; total: number }> {
  const q = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  return request(`/search/users?${q}`);
}

export async function searchPosts(params: {
  q: string;
  limit?: number;
  offset?: number;
}): Promise<{ posts: Post[]; total: number }> {
  const q = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  return request(`/search/posts?${q}`);
}

export async function searchHashtags(params: {
  q: string;
  limit?: number;
  offset?: number;
}): Promise<{ hashtags: Hashtag[]; total: number }> {
  const q = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  return request(`/search/hashtags?${q}`);
}

export async function getHashtagPosts(
  tag: string,
  params: PaginationParams = {}
): Promise<{ posts: Post[]; total: number }> {
  const q = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  return request(`/search/hashtags/${tag}/posts${q ? `?${q}` : ""}`);
}

// ─── Explore ──────────────────────────────────────────────────────────────────

export type TrendingWindow = "24h" | "7d" | "30d";

export async function getExplore(params: {
  window?: TrendingWindow;
}): Promise<{
  trendingHashtags: Hashtag[];
  events: Event[];
  trendingPosts: Post[];
}> {
  const q = params.window ? `?window=${params.window}` : "";
  return request(`/explore${q}`);
}

export async function getTrendingHashtags(params: {
  window?: TrendingWindow;
  limit?: number;
  offset?: number;
}): Promise<{ hashtags: Hashtag[]; total: number }> {
  const q = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  return request(`/explore/trending-hashtags${q ? `?${q}` : ""}`);
}

export async function getTrendingPosts(params: {
  window?: TrendingWindow;
  limit?: number;
}): Promise<{ posts: Post[] }> {
  const q = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  return request(`/explore/trending-posts${q ? `?${q}` : ""}`);
}

export async function getEvents(params: {
  featured?: boolean;
  upcoming?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ events: Event[]; total: number }> {
  const q = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  return request(`/explore/events${q ? `?${q}` : ""}`);
}

export async function createEvent(params: {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  featured?: boolean;
  hashtag?: string | null;
  startsAt: string;
  endsAt?: string | null;
}): Promise<Event> {
  return request("/explore/events", {
    method: "POST",
    body: params as Record<string, unknown>,
  });
}

export async function setEventFeatured(
  id: string,
  featured: boolean
): Promise<Event> {
  return request(`/explore/events/${id}/featured`, {
    method: "PATCH",
    body: { featured },
  });
}

// ─── Images ───────────────────────────────────────────────────────────────────

export type ImageDirectory = "ProfilePicture" | "BannerImage" | "PostImage";

export async function uploadImage(
  file: File | Blob,
  directory: ImageDirectory
): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);
  return request(`/images/upload?directory=${directory}`, {
    method: "POST",
    body: form,
  });
}
