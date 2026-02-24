import { LatLng } from "leaflet";
import { ExternalLinkIcon, MapPinIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { LocationPicker } from "@/components/map";
import { cn } from "@/lib/utils";
import type { Location } from "@/types/proto/api/v1/memo_service_pb";

const ZOOM_MEMO_PREFIX = "memo-map-zoom:";
const ZOOM_LOC_PREFIX = "memo-map-zoom:loc:";

function getStoredZoom(memoName: string, lat: number, lng: number): number | undefined {
  try {
    // Per-memo zoom takes priority
    const memoVal = localStorage.getItem(`${ZOOM_MEMO_PREFIX}${memoName}`);
    if (memoVal) return Number(memoVal);
    // Fallback to per-location zoom (saved from the picker dialog)
    const locVal = localStorage.getItem(`${ZOOM_LOC_PREFIX}${lat.toFixed(4)},${lng.toFixed(4)}`);
    if (locVal) return Number(locVal);
    return undefined;
  } catch {
    return undefined;
  }
}

function storeZoom(memoName: string, zoom: number) {
  try {
    localStorage.setItem(`${ZOOM_MEMO_PREFIX}${memoName}`, String(zoom));
  } catch {
    // ignore
  }
}

interface LocationDisplayProps {
  location?: Location;
  memoName: string;
  className?: string;
}

const LocationDisplay = ({ location, memoName, className }: LocationDisplayProps) => {
  if (!location) {
    return null;
  }

  const displayText = location.placeholder || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  const googleMapsUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
  const [initialZoom] = useState(() => getStoredZoom(memoName, location.latitude, location.longitude) ?? 13);

  const handleZoomChange = useCallback(
    (zoom: number) => {
      storeZoom(memoName, zoom);
    },
    [memoName],
  );

  return (
    <div className={cn("relative z-0 w-full flex flex-col rounded-xl overflow-hidden border border-border", className)}>
      <div className="w-full h-44 [&_.leaflet-container]:!h-full">
        <LocationPicker
          latlng={new LatLng(location.latitude, location.longitude)}
          readonly={true}
          initialZoom={initialZoom}
          onZoomChange={handleZoomChange}
        />
      </div>
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-2 bg-secondary/50 hover:bg-secondary transition-colors text-sm"
      >
        <MapPinIcon className="w-4 h-4 shrink-0 text-primary" />
        <span className="truncate flex-1 text-foreground">{displayText}</span>
        <ExternalLinkIcon className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
      </a>
    </div>
  );
};

export default LocationDisplay;
