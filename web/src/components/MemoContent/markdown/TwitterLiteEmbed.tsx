import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

interface QuotedTweetData {
  username: string;
  displayName: string;
  text: string;
  url: string;
  isVerified?: boolean;
  verifiedType?: string;
  createdAt?: string;
  authorAvatarUrl?: string;
  hasMedia?: boolean;
  mediaUrls?: string[];
}

interface TweetData {
  username: string;
  displayName: string;
  text: string;
  url: string;
  hasMedia?: boolean;
  thumbnailUrl?: string;
  mediaUrls?: string[];
  hasVideo?: boolean;
  videoThumbnailUrls?: string[];
  videoUrls?: string[];
  isVerified?: boolean;
  verifiedType?: string;
  createdAt?: string;
  replyCount?: number;
  retweetCount?: number;
  quoteCount?: number;
  likeCount?: number;
  authorAvatarUrl?: string;
  quotedTweet?: QuotedTweetData;
}

// =============================================================================
// Icons
// =============================================================================

const XLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const VerifiedBadge = ({ type }: { type?: string }) => (
  <svg
    className={cn(
      "inline-block shrink-0",
      type === "Business" ? "text-amber-500" : type === "Government" ? "text-gray-500" : "text-primary",
    )}
    viewBox="0 0 24 24"
    fill="currentColor"
    width="16"
    height="16"
  >
    <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .495.083.965.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
  </svg>
);

const ReplyIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z" />
  </svg>
);

const RetweetIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
  </svg>
);

const QuoteIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M4 4l16 0c1.1 0 2 .9 2 2l0 10c0 1.1-.9 2-2 2l-2 0 0 3-4-3-10 0c-1.1 0-2-.9-2-2L2 6c0-1.1.9-2 2-2z" />
  </svg>
);

const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// =============================================================================
// Data Fetching
// =============================================================================

const OEMBED_URL = "https://publish.twitter.com/oembed";
const FETCH_TIMEOUT_MS = 5000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripHtml(html: string): string {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function asCount(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.trunc(value);
  }
  if (typeof value === "string") {
    const n = Number(value.trim());
    if (Number.isFinite(n) && n >= 0) return Math.trunc(n);
  }
  return undefined;
}

function readCount(payload: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const c = asCount(payload[key]);
    if (c !== undefined) return c;
  }
  const legacy = isRecord(payload.legacy) ? payload.legacy : null;
  if (!legacy) return undefined;
  for (const key of keys) {
    const c = asCount(legacy[key]);
    if (c !== undefined) return c;
  }
  return undefined;
}

function buildSyndicationToken(id: string): string {
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return "";
  return ((numericId / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, "");
}

async function fetchJson(url: string): Promise<Record<string, unknown> | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const data = await res.json();
    return isRecord(data) ? data : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function formatTweetDate(raw: string): string | undefined {
  const trimmed = str(raw);
  if (!trimmed) return undefined;
  const d = new Date(trimmed);
  if (isNaN(d.getTime())) return undefined;
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function extractFromSyndication(payload: Record<string, unknown>, fallbackUrl: string): TweetData | null {
  const statusId = str(payload.id_str);
  const text = str(payload.full_text) || str(payload.text);
  if (!text) return null;

  const user = isRecord(payload.user) ? payload.user : null;
  const username = str(user?.screen_name);
  const displayName = str(user?.name) || (username ? `@${username}` : "Tweet");
  const isVerified = Boolean(user?.verified === true || user?.is_blue_verified === true);
  const verifiedType = str(user?.verified_type) || undefined;
  const authorAvatarUrl = str(user?.profile_image_url_https) || undefined;
  const createdAt = formatTweetDate(str(payload.created_at));
  const replyCount = readCount(payload, "reply_count", "conversation_count");
  const retweetCount = readCount(payload, "retweet_count");
  const quoteCount = readCount(payload, "quote_count");
  const likeCount = readCount(payload, "favorite_count", "like_count");

  // Extract media
  const mediaUrls: string[] = [];
  let hasVideo = false;
  const videoThumbnailUrls: string[] = [];
  const videoUrls: string[] = [];

  // Helper: extract best MP4 URL from video_info.variants
  function extractBestMp4(videoInfo: unknown): string {
    if (!isRecord(videoInfo)) return "";
    const variants = Array.isArray(videoInfo.variants) ? videoInfo.variants : [];
    let bestUrl = "";
    let bestBitrate = -1;
    for (const v of variants) {
      if (!isRecord(v)) continue;
      if (str(v.content_type) !== "video/mp4") continue;
      const bitrate = typeof v.bitrate === "number" ? v.bitrate : 0;
      const vUrl = str(v.url);
      if (vUrl && bitrate > bestBitrate) {
        bestBitrate = bitrate;
        bestUrl = vUrl;
      }
    }
    return bestUrl;
  }

  // 1. Photos array
  const photos = Array.isArray(payload.photos) ? payload.photos : [];
  for (const photo of photos) {
    if (!isRecord(photo)) continue;
    const url = str(photo.url) || str(photo.media_url_https) || str(photo.media_url);
    if (url && url.includes("pbs.twimg.com")) mediaUrls.push(url);
  }

  // 2. mediaDetails
  const details = payload.mediaDetails;
  if (Array.isArray(details)) {
    for (const media of details) {
      if (!isRecord(media)) continue;
      const type = str(media.type);
      const url = str(media.media_url_https) || str(media.media_url);
      if (!url) continue;
      if (type === "video" || type === "animated_gif") {
        hasVideo = true;
        if (!videoThumbnailUrls.includes(url)) videoThumbnailUrls.push(url);
        const mp4 = extractBestMp4(media.video_info);
        if (mp4) videoUrls.push(mp4);
      } else if (!mediaUrls.includes(url)) {
        mediaUrls.push(url);
      }
    }
  }

  // 3. entities.media fallback
  if (mediaUrls.length === 0 && videoThumbnailUrls.length === 0) {
    const entities = isRecord(payload.entities) ? payload.entities : null;
    const extEntities = isRecord(payload.extended_entities) ? payload.extended_entities : null;
    for (const source of [extEntities?.media, entities?.media]) {
      if (!Array.isArray(source)) continue;
      for (const media of source) {
        if (!isRecord(media)) continue;
        const type = str(media.type);
        const url = str(media.media_url_https) || str(media.media_url);
        if (!url) continue;
        if (type === "video" || type === "animated_gif") {
          hasVideo = true;
          if (!videoThumbnailUrls.includes(url)) videoThumbnailUrls.push(url);
          const mp4 = extractBestMp4(media.video_info);
          if (mp4) videoUrls.push(mp4);
        } else if (!mediaUrls.includes(url)) {
          mediaUrls.push(url);
        }
      }
      if (mediaUrls.length > 0 || videoThumbnailUrls.length > 0) break;
    }
  }

  // 4. Video poster fallback
  if (isRecord(payload.video)) {
    hasVideo = true;
    const poster = str(payload.video.poster);
    if (poster && !videoThumbnailUrls.includes(poster)) videoThumbnailUrls.push(poster);
    // Also try to extract MP4 from top-level video object
    if (videoUrls.length === 0) {
      const variants = Array.isArray(payload.video.variants) ? payload.video.variants : [];
      let bestUrl = "";
      let bestBitrate = -1;
      for (const v of variants) {
        if (!isRecord(v)) continue;
        if (str(v.type || v.content_type) !== "video/mp4") continue;
        const bitrate = typeof v.bitrate === "number" ? v.bitrate : 0;
        const vUrl = str(v.src || v.url);
        if (vUrl && bitrate > bestBitrate) {
          bestBitrate = bitrate;
          bestUrl = vUrl;
        }
      }
      if (bestUrl) videoUrls.push(bestUrl);
    }
  }

  const hasMedia = mediaUrls.length > 0 || hasVideo;
  const url = username && statusId ? `https://x.com/${username}/status/${statusId}` : fallbackUrl;

  // Quoted tweet
  let quotedTweet: QuotedTweetData | undefined;
  const qtRaw = payload.quoted_tweet;
  if (isRecord(qtRaw)) {
    const qtData = extractFromSyndication(qtRaw, "");
    if (qtData?.text) {
      quotedTweet = {
        username: qtData.username,
        displayName: qtData.displayName,
        text: qtData.text,
        url: qtData.url,
        isVerified: qtData.isVerified,
        verifiedType: qtData.verifiedType,
        createdAt: qtData.createdAt,
        authorAvatarUrl: qtData.authorAvatarUrl,
        hasMedia: qtData.hasMedia,
        mediaUrls: qtData.mediaUrls?.length ? qtData.mediaUrls : undefined,
      };
    }
  }

  return {
    username,
    displayName,
    text,
    url,
    hasMedia,
    thumbnailUrl: mediaUrls[0] || videoThumbnailUrls[0] || undefined,
    mediaUrls,
    hasVideo,
    videoThumbnailUrls,
    videoUrls: videoUrls.length > 0 ? videoUrls : undefined,
    isVerified,
    verifiedType,
    createdAt,
    replyCount,
    retweetCount,
    quoteCount,
    likeCount,
    authorAvatarUrl,
    quotedTweet,
  };
}

function extractFromOEmbed(payload: Record<string, unknown>, fallbackUrl: string): TweetData | null {
  const authorName = str(payload.author_name);
  const authorUrl = str(payload.author_url);
  const html = typeof payload.html === "string" ? payload.html : "";
  const thumbnailUrl = str(payload.thumbnail_url) || undefined;

  const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
  const text = stripHtml(paragraphs[0]?.[1] || html);
  if (!text) return null;

  const usernameMatch = authorUrl.match(/(?:twitter\.com|x\.com)\/([A-Za-z0-9_]+)/i);
  const username = usernameMatch?.[1] || "";
  const displayName = authorName || (username ? `@${username}` : "Tweet");
  const hasMedia = !!thumbnailUrl || /pic\.twitter\.com\/[A-Za-z0-9]+/i.test(html);

  return { username, displayName, text, url: fallbackUrl, hasMedia, thumbnailUrl };
}

async function fetchTweetData(tweetId: string, tweetUrl: string): Promise<TweetData | null> {
  // Try syndication API via backend proxy (bypasses CORS restriction)
  const token = buildSyndicationToken(tweetId);
  const proxyUrl = new URL("/api/twitter/tweet", window.location.origin);
  proxyUrl.searchParams.set("id", tweetId);
  if (token) proxyUrl.searchParams.set("token", token);

  const synPayload = await fetchJson(proxyUrl.toString());
  if (synPayload) {
    const data = extractFromSyndication(synPayload, tweetUrl);
    if (data) return data;
  }

  // Retry without token
  proxyUrl.searchParams.delete("token");
  const synPayload2 = await fetchJson(proxyUrl.toString());
  if (synPayload2) {
    const data = extractFromSyndication(synPayload2, tweetUrl);
    if (data) return data;
  }

  // Fallback to oEmbed (less data but works directly from browser)
  const oembedUrl = `${OEMBED_URL}?url=${encodeURIComponent(tweetUrl)}&omit_script=true&dnt=true`;
  const oembedPayload = await fetchJson(oembedUrl);
  if (oembedPayload) {
    return extractFromOEmbed(oembedPayload, tweetUrl);
  }

  return null;
}

// =============================================================================
// Rendering Helpers
// =============================================================================

function cleanDisplayText(text: string, hasMedia: boolean, hasQuote: boolean): string {
  let cleaned = text.replace(/\s*pic\.twitter\.com\/[A-Za-z0-9]+/g, "");
  if (hasMedia || hasQuote) {
    cleaned = cleaned.replace(/\s*https?:\/\/t\.co\/[A-Za-z0-9]+\s*$/g, "");
  }
  return cleaned.trim();
}

function parseTweetHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  return escaped
    .replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:var(--primary);text-decoration:underline">$1</a>',
    )
    .replace(
      /@(\w+)/g,
      '<a href="https://x.com/$1" target="_blank" rel="noopener noreferrer" style="color:var(--primary)">@$1</a>',
    )
    .replace(/\n/g, "<br />");
}

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return value.toLocaleString();
}

// =============================================================================
// Sub-components
// =============================================================================

function TweetSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-muted" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-3 w-24 rounded bg-muted" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-4/5 rounded bg-muted" />
      </div>
    </div>
  );
}

interface MediaItem {
  url: string;
  isVideo: boolean;
  videoUrl?: string;
}

function VideoPlayer({ thumbnailUrl, videoUrl, tweetUrl }: { thumbnailUrl: string; videoUrl: string; tweetUrl: string }) {
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!playing || failed) {
    return (
      <div
        className="relative cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          if (failed) {
            window.open(tweetUrl, "_blank", "noopener,noreferrer");
          } else {
            setPlaying(true);
          }
        }}
      >
        <img src={thumbnailUrl} alt="Video" loading="lazy" className="w-full max-h-[350px] object-cover" />
        <PlayOverlay />
      </div>
    );
  }

  return (
    <video
      src={videoUrl}
      controls
      autoPlay
      className="w-full max-h-[350px] bg-black"
      onClick={(e) => e.stopPropagation()}
      onError={() => {
        setFailed(true);
        setPlaying(false);
        window.open(tweetUrl, "_blank", "noopener,noreferrer");
      }}
    />
  );
}

function MediaGrid({ items, tweetUrl }: { items: MediaItem[]; tweetUrl: string }) {
  const count = items.length;

  if (count === 1) {
    const item = items[0];
    return (
      <div className="mx-4 mb-3 rounded-xl overflow-hidden">
        {item.isVideo && item.videoUrl ? (
          <VideoPlayer thumbnailUrl={item.url} videoUrl={item.videoUrl} tweetUrl={tweetUrl} />
        ) : (
          <div className="relative">
            <img src={item.url} alt="Photo" loading="lazy" className="w-full max-h-[350px] object-cover" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn("mx-4 mb-3 rounded-xl overflow-hidden grid gap-0.5", count === 2 ? "grid-cols-2" : "grid-cols-2 grid-rows-2")}
      style={{ aspectRatio: "16/9" }}
    >
      {items.map((item, i) => (
        <div key={i} className={cn("relative overflow-hidden", count === 3 && i === 0 && "row-span-2")}>
          {item.isVideo && item.videoUrl ? (
            <VideoPlayer thumbnailUrl={item.url} videoUrl={item.videoUrl} tweetUrl={tweetUrl} />
          ) : (
            <img
              src={item.url}
              alt={`Photo ${i + 1}`}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          )}
        </div>
      ))}
    </div>
  );
}

function PlayOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="24" fill="rgba(0,0,0,0.6)" />
        <path d="M19 15l14 9-14 9V15z" fill="white" />
      </svg>
    </div>
  );
}

function QuotedTweetCard({ data }: { data: QuotedTweetData }) {
  const displayText = cleanDisplayText(data.text, data.hasMedia === true, false);

  return (
    <div
      className="mx-4 mb-3 rounded-xl border border-border p-3 cursor-pointer hover:bg-accent/20 transition-colors"
      onClick={(e) => {
        e.stopPropagation();
        if ((e.target as HTMLElement).closest("a")) return;
        if (data.url) window.open(data.url, "_blank", "noopener,noreferrer");
      }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        {data.authorAvatarUrl && <img src={data.authorAvatarUrl} className="w-5 h-5 rounded-full" alt="" />}
        {data.displayName && <span className="text-xs font-semibold text-foreground">{data.displayName}</span>}
        {data.isVerified && <VerifiedBadge type={data.verifiedType} />}
        {data.username && <span className="text-xs text-muted-foreground">@{data.username}</span>}
      </div>
      <div
        className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words"
        dangerouslySetInnerHTML={{ __html: parseTweetHtml(displayText) }}
      />
      {data.mediaUrls?.[0] && (
        <img src={data.mediaUrls[0]} alt="Quoted tweet media" loading="lazy" className="mt-2 rounded-xl w-full h-auto object-contain bg-muted" />
      )}
    </div>
  );
}

function MetricItem({ icon, value, color, label }: { icon: React.ReactNode; value: number; color: string; label: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs", color)} title={label}>
      {icon}
      <span>{formatCount(value)}</span>
    </span>
  );
}

function TweetFooter({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-center justify-between px-4 py-2 border-t border-border">
      <button
        onClick={async (e) => {
          e.stopPropagation();
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            /* clipboard unavailable */
          }
        }}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {copied ? <CheckIcon /> : <LinkIcon />}
        <span>{copied ? "Copied!" : "Copy link"}</span>
      </button>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        Open in X
      </a>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function TwitterLiteEmbed({ tweetId, url }: { tweetId: string; url: string }) {
  const [tweet, setTweet] = useState<TweetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetchTweetData(tweetId, url).then((data) => {
      if (cancelled) return;
      if (data) {
        setTweet(data);
      } else {
        setError(true);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [tweetId, url]);

  if (loading) return <TweetSkeleton />;

  if (error || !tweet) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
        {url}
      </a>
    );
  }

  const hasQuote = !!tweet.quotedTweet?.text;
  const displayText = cleanDisplayText(tweet.text, tweet.hasMedia === true, hasQuote);

  // Build unified media list (photos + video thumbnails, max 4)
  const photoUrls = tweet.mediaUrls?.length ? tweet.mediaUrls : [];
  const videoThumbs = tweet.videoThumbnailUrls?.length ? tweet.videoThumbnailUrls : [];
  const videoSrcs = tweet.videoUrls || [];
  const fallbackUrls = photoUrls.length === 0 && videoThumbs.length === 0 && tweet.thumbnailUrl ? [tweet.thumbnailUrl] : [];
  const allMedia: MediaItem[] = [
    ...(photoUrls.length > 0 ? photoUrls : fallbackUrls).map((u) => ({ url: u, isVideo: false })),
    ...videoThumbs.map((u, i) => ({ url: u, isVideo: true, videoUrl: videoSrcs[i] })),
  ].slice(0, 4);

  // Build metrics
  const metrics: Array<{ icon: React.ReactNode; value: number; color: string; label: string }> = [];
  if (typeof tweet.replyCount === "number")
    metrics.push({ icon: <ReplyIcon />, value: tweet.replyCount, color: "text-blue-500", label: "Replies" });
  if (typeof tweet.retweetCount === "number")
    metrics.push({ icon: <RetweetIcon />, value: tweet.retweetCount, color: "text-green-500", label: "Retweets" });
  if (typeof tweet.quoteCount === "number")
    metrics.push({ icon: <QuoteIcon />, value: tweet.quoteCount, color: "text-blue-400", label: "Quotes" });
  if (typeof tweet.likeCount === "number")
    metrics.push({ icon: <HeartIcon />, value: tweet.likeCount, color: "text-pink-500", label: "Likes" });

  return (
    <div
      className="relative rounded-xl border border-border bg-card overflow-hidden cursor-pointer transition-colors hover:bg-accent/30"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a, button")) return;
        window.open(tweet.url, "_blank", "noopener,noreferrer");
      }}
    >
      {/* X logo overlay */}
      <div className="absolute top-3 right-3 text-muted-foreground/30">
        <XLogo />
      </div>

      {/* Header: avatar + name + handle */}
      <div className="flex items-center gap-3 p-4 pb-0">
        {tweet.authorAvatarUrl ? (
          <img src={tweet.authorAvatarUrl} alt={tweet.displayName} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-bold">
            {tweet.displayName?.[0]?.toUpperCase() || "T"}
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-0.5">
            <span className="font-semibold text-foreground truncate text-sm">{tweet.displayName}</span>
            {tweet.isVerified && <VerifiedBadge type={tweet.verifiedType} />}
          </div>
          {tweet.username && <span className="text-muted-foreground text-xs">@{tweet.username}</span>}
        </div>
      </div>

      {/* Tweet text */}
      <div
        className="px-4 pt-2 pb-3 text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words"
        dangerouslySetInnerHTML={{ __html: parseTweetHtml(displayText) }}
      />

      {/* Media grid */}
      {allMedia.length > 0 && <MediaGrid items={allMedia} tweetUrl={tweet.url} />}

      {/* Quoted tweet */}
      {tweet.quotedTweet?.text && <QuotedTweetCard data={tweet.quotedTweet} />}

      {/* Info row: date + metrics */}
      {(tweet.createdAt || metrics.length > 0) && (
        <div className="flex items-center justify-between px-4 pb-3 flex-wrap gap-y-1">
          {tweet.createdAt ? <span className="text-xs text-muted-foreground">{tweet.createdAt}</span> : <span />}
          {metrics.length > 0 && (
            <div className="flex items-center gap-3">
              {metrics.map((m) => (
                <MetricItem key={m.label} icon={m.icon} value={m.value} color={m.color} label={m.label} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <TweetFooter url={tweet.url} />
    </div>
  );
}
