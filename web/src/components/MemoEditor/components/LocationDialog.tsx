import { LatLng } from "leaflet";
import { LoaderIcon, SearchIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { LocationPicker } from "@/components/map";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { useTranslate } from "@/utils/i18n";
import type { LocationDialogProps } from "../types";

const GEOCODING_SEARCH = {
  endpoint: "https://nominatim.openstreetmap.org/search",
  userAgent: "Memos/1.0 (https://github.com/usememos/memos)",
} as const;

export const LocationDialog = ({
  open,
  onOpenChange,
  state,
  locationInitialized: _locationInitialized,
  onPositionChange,
  onUpdateCoordinate,
  onPlaceholderChange,
  onZoomChange,
  onCancel,
  onConfirm,
}: LocationDialogProps) => {
  const t = useTranslate();
  const { placeholder, position, latInput, lngInput, altInput, zoom } = state;

  const [addressQuery, setAddressQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleAddressSearch = useCallback(async () => {
    const query = addressQuery.trim();
    if (!query) return;

    setIsSearching(true);
    try {
      const url = `${GEOCODING_SEARCH.endpoint}?q=${encodeURIComponent(query)}&format=json&limit=1`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": GEOCODING_SEARCH.userAgent,
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        onPositionChange(new LatLng(parseFloat(lat), parseFloat(lon)));
      }
    } catch (error) {
      console.error("Failed to geocode address:", error);
    } finally {
      setIsSearching(false);
    }
  }, [addressQuery, onPositionChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(28rem,calc(100vw-2rem))] p-0!">
        <VisuallyHidden>
          <DialogClose />
        </VisuallyHidden>
        <VisuallyHidden>
          <DialogTitle>{t("tooltip.select-location")}</DialogTitle>
        </VisuallyHidden>
        <VisuallyHidden>
          <DialogDescription>Select a location on the map or enter coordinates manually</DialogDescription>
        </VisuallyHidden>
        <div className="flex flex-col">
          <div className="w-full h-64 overflow-hidden rounded-t-md bg-muted/30">
            <LocationPicker latlng={position} initialZoom={zoom} onChange={onPositionChange} onZoomChange={onZoomChange} />
          </div>
          <div className="w-full flex flex-col p-3 gap-3">
            <div className="flex gap-2">
              <Input
                placeholder="Search address..."
                value={addressQuery}
                onChange={(e) => setAddressQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddressSearch();
                  }
                }}
                className="h-9"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={handleAddressSearch}
                disabled={isSearching || !addressQuery.trim()}
              >
                {isSearching ? <LoaderIcon className="size-4 animate-spin" /> : <SearchIcon className="size-4" />}
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-1">
                <Label htmlFor="memo-location-lat" className="text-xs uppercase tracking-wide text-muted-foreground">
                  Lat
                </Label>
                <Input
                  id="memo-location-lat"
                  placeholder="Lat"
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  value={latInput}
                  onChange={(e) => onUpdateCoordinate("lat", e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="memo-location-lng" className="text-xs uppercase tracking-wide text-muted-foreground">
                  Lng
                </Label>
                <Input
                  id="memo-location-lng"
                  placeholder="Lng"
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  value={lngInput}
                  onChange={(e) => onUpdateCoordinate("lng", e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="memo-location-alt" className="text-xs uppercase tracking-wide text-muted-foreground">
                  Alt (m)
                </Label>
                <Input
                  id="memo-location-alt"
                  placeholder="Alt"
                  type="number"
                  step="any"
                  value={altInput}
                  onChange={(e) => onUpdateCoordinate("alt", e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="memo-location-placeholder" className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("tooltip.select-location")}
              </Label>
              <Textarea
                id="memo-location-placeholder"
                placeholder="Choose a position first."
                value={placeholder}
                disabled={!position}
                onChange={(e) => onPlaceholderChange(e.target.value)}
                className="min-h-16"
              />
            </div>
            <div className="w-full flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={onCancel}>
                {t("common.close")}
              </Button>
              <Button onClick={onConfirm} disabled={!position || placeholder.trim().length === 0}>
                {t("common.confirm")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
