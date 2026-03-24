import { useMemo } from "react";

export type MapProvider = "google" | "apple";

/**
 * Detects whether the device should use Apple Maps (iOS) or Google Maps (Android/Web).
 * Returns the provider type and a function to open directions in the appropriate map app.
 */
export const useMapProvider = () => {
  const provider: MapProvider = useMemo(() => {
    if (typeof navigator === "undefined") return "google";
    const ua = navigator.userAgent || navigator.vendor || "";
    // Detect iOS: iPhone, iPad, iPod
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    return isIOS ? "apple" : "google";
  }, []);

  const openDirections = (
    destLat: number,
    destLng: number,
    originLat?: number,
    originLng?: number
  ) => {
    if (provider === "apple") {
      // Apple Maps URL scheme
      const origin = originLat && originLng ? `&saddr=${originLat},${originLng}` : "";
      window.open(`https://maps.apple.com/?daddr=${destLat},${destLng}${origin}`, "_blank");
    } else {
      // Google Maps
      const origin = originLat && originLng ? `&origin=${originLat},${originLng}` : "";
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}${origin}`,
        "_blank"
      );
    }
  };

  return { provider, openDirections };
};
