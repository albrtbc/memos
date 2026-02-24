import { useEffect, useState } from "react";

// =============================================================================
// Types
// =============================================================================

interface RedditData {
  title: string;
  author: string;
  subreddit: string;
  score: number;
  numComments: number;
  createdUtc: number;
  selftext: string;
  permalink: string;
  url: string;
  thumbnail: string;
  previewUrl: string;
  isVideo: boolean;
  isSelf: boolean;
  postHint: string;
  linkUrl: string;
}

// =============================================================================
// Icons
// =============================================================================

const RedditLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);

const ArrowUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5" />
    <path d="M5 12l7-7 7 7" />
  </svg>
);

const CommentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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

const ExternalLinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

// =============================================================================
// Data Fetching
// =============================================================================

const FETCH_TIMEOUT_MS = 8000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function num(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

async function fetchRedditData(postUrl: string): Promise<RedditData | null> {
  const proxyUrl = new URL("/api/reddit/post", window.location.origin);
  proxyUrl.searchParams.set("url", postUrl);

  const raw = await fetchJson(proxyUrl.toString());
  if (!Array.isArray(raw) || raw.length < 1) return null;

  const listing = raw[0];
  if (!isRecord(listing)) return null;
  const data = (listing as any)?.data?.children?.[0]?.data;
  if (!isRecord(data)) return null;

  const title = decodeHtmlEntities(str(data.title));
  const selftext = str(data.selftext);
  const thumbnail = str(data.thumbnail);
  const previewImages = (data.preview as any)?.images;
  let previewUrl = "";
  if (Array.isArray(previewImages) && previewImages.length > 0) {
    const source = previewImages[0]?.source;
    if (isRecord(source)) {
      previewUrl = decodeHtmlEntities(str(source.url));
    }
  }

  if (!title) return null;

  return {
    title,
    author: str(data.author),
    subreddit: str(data.subreddit),
    score: num(data.score),
    numComments: num(data.num_comments),
    createdUtc: num(data.created_utc),
    selftext,
    permalink: str(data.permalink),
    url: postUrl,
    thumbnail,
    previewUrl,
    isVideo: data.is_video === true,
    isSelf: data.is_self === true,
    postHint: str(data.post_hint),
    linkUrl: str(data.url),
  };
}

// =============================================================================
// Formatters
// =============================================================================

function formatScore(score: number): string {
  if (score >= 1_000_000) return `${(score / 1_000_000).toFixed(1)}M`;
  if (score >= 1_000) return `${(score / 1_000).toFixed(1)}k`;
  return score.toString();
}

function formatDate(utc: number): string {
  if (!utc) return "";
  const date = new Date(utc * 1000);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isValidThumbnail(thumb: string): boolean {
  return !!thumb && thumb !== "self" && thumb !== "default" && thumb !== "nsfw" && thumb !== "spoiler" && thumb.startsWith("http");
}

// =============================================================================
// Sub-components
// =============================================================================

function RedditSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden animate-pulse" style={{ maxWidth: 600 }}>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-muted" />
          <div className="h-3 w-32 rounded bg-muted" />
        </div>
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-40 w-full rounded bg-muted" />
        <div className="flex gap-4">
          <div className="h-3 w-16 rounded bg-muted" />
          <div className="h-3 w-20 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

function RedditFooter({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-t border-border">
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
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        Open in Reddit
        <ExternalLinkIcon />
      </a>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function RedditLiteEmbed({ url }: { url: string }) {
  const [data, setData] = useState<RedditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetchRedditData(url).then((result) => {
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

  if (loading) return <div className="flex justify-center"><RedditSkeleton /></div>;

  if (error || !data) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
        {url}
      </a>
    );
  }

  const imageUrl = data.previewUrl || (isValidThumbnail(data.thumbnail) ? data.thumbnail : "");
  const showImage = !!imageUrl && !data.isSelf;

  return (
    <div className="flex justify-center">
      <div
        className="relative rounded-xl border border-border bg-card overflow-hidden cursor-pointer transition-colors hover:bg-accent/30"
        style={{ maxWidth: 600, width: "100%" }}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a, button")) return;
          window.open(data.url, "_blank", "noopener,noreferrer");
        }}
      >
        {/* Reddit logo overlay */}
        <div className="absolute top-3 right-3 z-10 text-muted-foreground/30">
          <RedditLogo />
        </div>

        {/* Header: subreddit + author + date */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">r/{data.subreddit}</span>
            <span>·</span>
            <span>u/{data.author}</span>
            {data.createdUtc > 0 && (
              <>
                <span>·</span>
                <span>{formatDate(data.createdUtc)}</span>
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="px-4 pb-2">
          <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-3">{data.title}</h3>
        </div>

        {/* Self text preview */}
        {data.isSelf && data.selftext && (
          <div className="px-4 pb-2">
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4 whitespace-pre-wrap break-words">
              {data.selftext.length > 500 ? data.selftext.slice(0, 500) + "…" : data.selftext}
            </p>
          </div>
        )}

        {/* Image preview */}
        {showImage && (
          <div className="px-4 pb-2">
            <div className="relative rounded-lg overflow-hidden bg-muted">
              <img
                src={imageUrl}
                alt={data.title}
                loading="lazy"
                className="w-full max-h-[400px] object-contain bg-black"
              />
              {data.isVideo && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-black/55 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Metrics row */}
        <div className="flex items-center gap-4 px-4 py-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowUpIcon />
            <span className="font-medium">{formatScore(data.score)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CommentIcon />
            <span>{formatScore(data.numComments)} comments</span>
          </div>
        </div>

        {/* Footer */}
        <RedditFooter url={data.url} />
      </div>
    </div>
  );
}
