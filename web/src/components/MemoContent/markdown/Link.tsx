import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { ReactMarkdownProps } from "./types";

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

let twttrLoadPromise: Promise<void> | null = null;

function loadTwitterWidgets(): Promise<void> {
  if (twttrLoadPromise) return twttrLoadPromise;
  twttrLoadPromise = new Promise<void>((resolve) => {
    if ((window as any).twttr) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
  return twttrLoadPromise;
}

function TwitterEmbed({ tweetId }: { tweetId: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    loadTwitterWidgets().then(() => {
      if (!cancelled && ref.current) {
        ref.current.innerHTML = "";
        (window as any).twttr?.widgets?.createTweet(tweetId, ref.current);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [tweetId]);

  return <div ref={ref} className="flex justify-center" />;
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
 * Auto-embeds YouTube and Twitter/X URLs when pasted as bare links
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
      return <TwitterEmbed tweetId={tweetId} />;
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
