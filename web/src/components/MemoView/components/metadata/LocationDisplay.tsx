import { create } from "@bufbuild/protobuf";
import { LatLng } from "leaflet";
import { ExternalLinkIcon, MapPinIcon } from "lucide-react";
import { useCallback, useRef } from "react";
import { LocationPicker } from "@/components/map";
import { useUpdateMemo } from "@/hooks/useMemoQueries";
import { cn } from "@/lib/utils";
import { LocationSchema, type Location } from "@/types/proto/api/v1/memo_service_pb";

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
  const initialZoom = location.zoom || 13;

  const { mutateAsync: updateMemo } = useUpdateMemo();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleZoomChange = useCallback(
    (zoom: number) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        const updatedLocation = create(LocationSchema, {
          placeholder: location.placeholder,
          latitude: location.latitude,
          longitude: location.longitude,
          altitude: location.altitude,
          zoom,
        });
        updateMemo({ update: { name: memoName, location: updatedLocation }, updateMask: ["location"] }).catch((err) =>
          console.error("Failed to persist zoom:", err),
        );
      }, 500);
    },
    [memoName, location, updateMemo],
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
