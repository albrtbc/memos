import { cn } from "@/lib/utils";
import type { ReactMarkdownProps } from "./types";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement>, ReactMarkdownProps {
  children: React.ReactNode;
}

const YOUTUBE_RE =
  /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/;

function getYouTubeVideoId(url: string): string | null {
  const match = url.match(YOUTUBE_RE);
  return match ? match[1] : null;
}

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
 * Auto-embeds YouTube URLs when pasted as bare links
 */
export const Link = ({ children, className, href, node: _node, ...props }: LinkProps) => {
  if (href) {
    const videoId = getYouTubeVideoId(href);
    if (videoId && isBarePastedLink(href, children)) {
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
