import { create } from "@bufbuild/protobuf";
import { LatLng } from "leaflet";
import { useState } from "react";
import { Location, LocationSchema } from "@/types/proto/api/v1/memo_service_pb";
import { LocationState } from "../types/insert-menu";

export const useLocation = (initialLocation?: Location) => {
  const [locationInitialized, setLocationInitialized] = useState(false);
  const [state, setState] = useState<LocationState>({
    placeholder: initialLocation?.placeholder || "",
    position: initialLocation ? new LatLng(initialLocation.latitude, initialLocation.longitude, initialLocation.altitude || undefined) : undefined,
    latInput: initialLocation ? String(initialLocation.latitude) : "",
    lngInput: initialLocation ? String(initialLocation.longitude) : "",
    altInput: initialLocation?.altitude ? String(initialLocation.altitude) : "",
  });

  const updatePosition = (position?: LatLng) => {
    setState((prev) => ({
      ...prev,
      position,
      latInput: position ? String(position.lat) : "",
      lngInput: position ? String(position.lng) : "",
      altInput: position?.alt != null ? String(position.alt) : prev.altInput,
    }));
  };

  const handlePositionChange = (position: LatLng) => {
    if (!locationInitialized) setLocationInitialized(true);
    updatePosition(position);
  };

  const updateCoordinate = (type: "lat" | "lng" | "alt", value: string) => {
    if (type === "alt") {
      setState((prev) => ({ ...prev, altInput: value }));
      return;
    }
    setState((prev) => ({ ...prev, [type === "lat" ? "latInput" : "lngInput"]: value }));
    const num = parseFloat(value);
    const isValid = type === "lat" ? !isNaN(num) && num >= -90 && num <= 90 : !isNaN(num) && num >= -180 && num <= 180;
    if (isValid && state.position) {
      updatePosition(type === "lat" ? new LatLng(num, state.position.lng, state.position.alt) : new LatLng(state.position.lat, num, state.position.alt));
    }
  };

  const setPlaceholder = (placeholder: string) => {
    setState((prev) => ({ ...prev, placeholder }));
  };

  const reset = () => {
    setState({
      placeholder: "",
      position: undefined,
      latInput: "",
      lngInput: "",
      altInput: "",
    });
    setLocationInitialized(false);
  };

  const getLocation = (): Location | undefined => {
    if (!state.position || !state.placeholder.trim()) {
      return undefined;
    }
    const alt = parseFloat(state.altInput);
    return create(LocationSchema, {
      latitude: state.position.lat,
      longitude: state.position.lng,
      altitude: !isNaN(alt) ? alt : 0,
      placeholder: state.placeholder,
    });
  };

  return {
    state,
    locationInitialized,
    handlePositionChange,
    updateCoordinate,
    setPlaceholder,
    reset,
    getLocation,
  };
};
