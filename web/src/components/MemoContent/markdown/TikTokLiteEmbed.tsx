import { useEffect, useState } from "react";

// =============================================================================
// Types
// =============================================================================

interface TikTokData {
  title: string;
  authorName: string;
  authorUrl: string;
  username: string;
  thumbnailUrl: string;
  url: string;
}

// =============================================================================
// Icons
// =============================================================================

const TikTokLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.51a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13a8.28 8.28 0 005.58 2.18V11.7a4.83 4.83 0 01-3.77-1.24V6.69h3.77z" />
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

const PlayIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="32" fill="rgba(0,0,0,0.55)" />
    <path d="M26 20l20 12-20 12V20z" fill="white" />
  </svg>
);

// =============================================================================
// Data Fetching
// =============================================================================

const FETCH_TIMEOUT_MS = 5000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
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

function extractUsername(authorUrl: string): string {
  const match = authorUrl.match(/tiktok\.com\/@([A-Za-z0-9_.]+)/);
  return match ? match[1] : "";
}

async function fetchTikTokData(videoUrl: string): Promise<TikTokData | null> {
  const proxyUrl = new URL("/api/tiktok/oembed", window.location.origin);
  proxyUrl.searchParams.set("url", videoUrl);

  const payload = await fetchJson(proxyUrl.toString());
  if (!payload) return null;

  const title = str(payload.title);
  const authorName = str(payload.author_name);
  const authorUrl = str(payload.author_url);
  const thumbnailUrl = str(payload.thumbnail_url);

  if (!thumbnailUrl && !title) return null;

  return {
    title,
    authorName,
    authorUrl,
    username: extractUsername(authorUrl) || authorName,
    thumbnailUrl,
    url: videoUrl,
  };
}

// =============================================================================
// Sub-components
// =============================================================================

function TikTokSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden animate-pulse" style={{ maxWidth: 360 }}>
      <div className="aspect-[9/16] max-h-[400px] bg-muted" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-3/4 rounded bg-muted" />
      </div>
    </div>
  );
}

function TikTokFooter({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-center justify-between px-3 py-2 border-t border-border">
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
        Open in TikTok
      </a>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function TikTokLiteEmbed({ url }: { url: string }) {
  const [data, setData] = useState<TikTokData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetchTikTokData(url).then((result) => {
      if (cancelled) return;
      if (result) {
        setData(result);
      } else {
        setError(true);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (loading) return <div className="flex justify-center"><TikTokSkeleton /></div>;

  if (error || !data) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
        {url}
      </a>
    );
  }

  return (
    <div className="flex justify-center">
    <div
      className="relative rounded-xl border border-border bg-card overflow-hidden cursor-pointer transition-colors hover:bg-accent/30"
      style={{ maxWidth: 360, width: "100%" }}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a, button")) return;
        window.open(data.url, "_blank", "noopener,noreferrer");
      }}
    >
      {/* TikTok logo overlay */}
      <div className="absolute top-3 right-3 z-10 text-muted-foreground/30">
        <TikTokLogo />
      </div>

      {/* Thumbnail with play overlay */}
      {data.thumbnailUrl && (
        <div className="relative bg-muted">
          <img
            src={data.thumbnailUrl}
            alt={data.title || "TikTok video"}
            loading="lazy"
            className="w-full max-h-[400px] object-contain bg-black"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayIcon />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-3">
        {/* Author */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-[10px] font-bold shrink-0">
            {data.authorName?.[0]?.toUpperCase() || "T"}
          </div>
          <span className="font-semibold text-foreground text-sm truncate">{data.authorName}</span>
          {data.username && data.username !== data.authorName && (
            <span className="text-muted-foreground text-xs truncate">@{data.username}</span>
          )}
        </div>

        {/* Title / description */}
        {data.title && (
          <p className="text-sm text-foreground leading-relaxed line-clamp-3 whitespace-pre-wrap break-words">{data.title}</p>
        )}
      </div>

      {/* Footer */}
      <TikTokFooter url={data.url} />
    </div>
    </div>
  );
}
