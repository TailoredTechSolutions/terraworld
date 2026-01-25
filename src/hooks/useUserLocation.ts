import { useState, useEffect } from "react";

interface UserLocation {
  lat: number;
  lng: number;
}

interface UseUserLocationReturn {
  location: UserLocation | null;
  error: string | null;
  loading: boolean;
  requestLocation: () => void;
}

// Default to Manila if geolocation fails
const DEFAULT_LOCATION: UserLocation = {
  lat: 14.5995,
  lng: 120.9842,
};

export const useUserLocation = (): UseUserLocationReturn => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLocation(DEFAULT_LOCATION);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        let errorMessage = "Unable to get your location";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = "Location permission denied";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case err.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }
        setError(errorMessage);
        setLocation(DEFAULT_LOCATION); // Fallback to default
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  };

  // Auto-request on mount
  useEffect(() => {
    requestLocation();
  }, []);

  return { location, error, loading, requestLocation };
};

// Calculate distance between two points using Haversine formula
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg: number): number => deg * (Math.PI / 180);

// Calculate delivery fee based on distance
export const calculateDeliveryFee = (distanceKm: number): number => {
  const baseFee = 45;
  const perKmRate = 8;
  const fee = baseFee + (distanceKm * perKmRate);
  return Math.round(Math.min(fee, 150)); // Cap at ₱150
};

// Calculate ETA based on distance
export const calculateETA = (distanceKm: number): { min: number; max: number } => {
  const avgSpeed = 25; // km/h in city traffic
  const baseTime = 15; // Base preparation time in minutes
  const travelTime = (distanceKm / avgSpeed) * 60;
  
  return {
    min: Math.round(baseTime + travelTime),
    max: Math.round(baseTime + travelTime + 15), // 15 min buffer
  };
};