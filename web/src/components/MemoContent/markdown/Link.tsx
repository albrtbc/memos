import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { ReactMarkdownProps } from "./types";
import { RedditLiteEmbed } from "./RedditLiteEmbed";
import { TikTokLiteEmbed } from "./TikTokLiteEmbed";
import { TwitterLiteEmbed } from "./TwitterLiteEmbed";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement>, ReactMarkdownProps {
  children: React.ReactNode;
}

// --- YouTube ---

const YOUTUBE_RE =
  /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/;

function getYouTubeVideoId(url: string): string | null {
  const match = url.match(YOUTUBE_RE);
  return match ? match[1] : null;
}

// --- Twitter / X ---

const TWITTER_RE = /^https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/;

function getTwitterTweetId(url: string): string | null {
  const match = url.match(TWITTER_RE);
  return match ? match[1] : null;
}

// --- TikTok ---

const TIKTOK_RE = /^https?:\/\/(?:(?:www|m|vm)\.)?tiktok\.com\//;

function isTikTokUrl(url: string): boolean {
  return TIKTOK_RE.test(url);
}

// --- Instagram ---

const INSTAGRAM_RE = /^https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|reels)\/([A-Za-z0-9_-]+)/;

function getInstagramPostId(url: string): string | null {
  const match = url.match(INSTAGRAM_RE);
  return match ? match[1] : null;
}

let instagramLoadPromise: Promise<void> | null = null;

function loadInstagramEmbed(): Promise<void> {
  if (instagramLoadPromise) return instagramLoadPromise;
  instagramLoadPromise = new Promise<void>((resolve) => {
    if ((window as any).instgrm) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
  return instagramLoadPromise;
}

function InstagramEmbed({ url, postId }: { url: string; postId: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    loadInstagramEmbed().then(() => {
      if (!cancelled && ref.current) {
        ref.current.innerHTML = "";
        const blockquote = document.createElement("blockquote");
        blockquote.className = "instagram-media";
        blockquote.setAttribute("data-instgrm-captioned", "");
        blockquote.setAttribute("data-instgrm-permalink", url);
        blockquote.setAttribute("data-instgrm-version", "14");
        blockquote.style.maxWidth = "540px";
        blockquote.style.width = "100%";
        const link = document.createElement("a");
        link.href = url;
        blockquote.appendChild(link);
        ref.current.appendChild(blockquote);

        (window as any).instgrm?.Embeds?.process();
      }
    });
    return () => {
      cancelled = true;
    };
  }, [url, postId]);

  return <div ref={ref} className="flex justify-center" />;
}

// --- Reddit ---

const REDDIT_RE = /^https?:\/\/(?:www\.)?reddit\.com\/r\/\w+\/comments\/\w+/;

function isRedditPost(url: string): boolean {
  return REDDIT_RE.test(url);
}

// --- Helpers ---

function isBarePastedLink(href: string, children: React.ReactNode): boolean {
  if (typeof children === "string") {
    return children === href;
  }
  if (Array.isArray(children) && children.length === 1 && typeof children[0] === "string") {
    return children[0] === href;
  }
  return false;
}

/**
 * Link component for external links
 * Opens in new tab with security attributes
 * Auto-embeds YouTube, Twitter/X, Reddit, TikTok, and Instagram URLs when pasted as bare links
 */
export const Link = ({ children, className, href, node: _node, ...props }: LinkProps) => {
  if (href && isBarePastedLink(href, children)) {
    const videoId = getYouTubeVideoId(href);
    if (videoId) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video"
          className="w-full aspect-video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      );
    }

    const tweetId = getTwitterTweetId(href);
    if (tweetId) {
      return <TwitterLiteEmbed tweetId={tweetId} url={href} />;
    }

    if (isRedditPost(href)) {
      return <RedditLiteEmbed url={href} />;
    }

    if (isTikTokUrl(href)) {
      return <TikTokLiteEmbed url={href} />;
    }

    const igPostId = getInstagramPostId(href);
    if (igPostId) {
      return <InstagramEmbed url={href} postId={igPostId} />;
    }
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "text-primary underline decoration-primary/50 underline-offset-2 transition-colors hover:decoration-primary",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
};
