import { ChevronLeft, ChevronRight, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imgUrls: string[];
  initialIndex?: number;
}

function PreviewImageDialog({ open, onOpenChange, imgUrls, initialIndex = 0 }: Props) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const touchStartX = useRef<number | null>(null);
  const hasMultiple = imgUrls.length > 1;

  // Update current index when initialIndex prop changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % imgUrls.length);
  }, [imgUrls.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + imgUrls.length) % imgUrls.length);
  }, [imgUrls.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!open) return;

      switch (event.key) {
        case "Escape":
          onOpenChange(false);
          break;
        case "ArrowLeft":
          if (hasMultiple) goPrev();
          break;
        case "ArrowRight":
          if (hasMultiple) goNext();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange, hasMultiple, goNext, goPrev]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !hasMultiple) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      if (delta < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  // Return early if no images provided
  if (!imgUrls.length) return null;

  // Ensure currentIndex is within bounds
  const safeIndex = Math.max(0, Math.min(currentIndex, imgUrls.length - 1));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!w-[100vw] !h-[100vh] !max-w-[100vw] !max-h-[100vw] p-0 border-0 shadow-none bg-transparent [&>button]:hidden"
        aria-describedby="image-preview-description"
      >
        {/* Close button */}
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={handleClose}
            variant="secondary"
            size="icon"
            className="rounded-full bg-popover/20 hover:bg-popover/30 border-border/20 backdrop-blur-sm"
            aria-label="Close image preview"
          >
            <X className="h-4 w-4 text-popover-foreground" />
          </Button>
        </div>

        {/* Prev arrow button (desktop only) */}
        {hasMultiple && (
          <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 hidden sm:flex">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              variant="secondary"
              size="icon"
              className="rounded-full bg-popover/20 hover:bg-popover/30 border-border/20 backdrop-blur-sm"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 text-popover-foreground" />
            </Button>
          </div>
        )}

        {/* Next arrow button (desktop only) */}
        {hasMultiple && (
          <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden sm:flex">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              variant="secondary"
              size="icon"
              className="rounded-full bg-popover/20 hover:bg-popover/30 border-border/20 backdrop-blur-sm"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5 text-popover-foreground" />
            </Button>
          </div>
        )}

        {/* Image container */}
        <div
          className="w-full h-full flex items-center justify-center p-4 sm:p-8 overflow-auto"
          onClick={handleBackdropClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={imgUrls[safeIndex]}
            alt={`Preview image ${safeIndex + 1} of ${imgUrls.length}`}
            className="max-w-full max-h-full object-contain select-none"
            draggable={false}
            loading="eager"
            decoding="async"
          />
        </div>

        {/* Image counter */}
        {hasMultiple && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <span className="px-3 py-1 rounded-full text-sm bg-popover/20 text-popover-foreground backdrop-blur-sm">
              {safeIndex + 1} / {imgUrls.length}
            </span>
          </div>
        )}

        {/* Screen reader description */}
        <div id="image-preview-description" className="sr-only">
          Image preview dialog. Press Escape to close or click outside the image.
          {hasMultiple && " Use arrow keys to navigate between images."}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PreviewImageDialog;
