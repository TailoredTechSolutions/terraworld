import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsRenderer } from "@react-google-maps/api";
import { Farm } from "@/data/products";
import { MapPin, Star, Navigation, Clock, Truck, Leaf, Phone, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GOOGLE_MAPS_API_KEY } from "@/config/maps";
import { useTheme } from "next-themes";

interface FarmMapProps {
  farms: Farm[];
  userLocation?: { lat: number; lng: number };
  onFarmSelect?: (farm: Farm) => void;
  selectedFarm?: Farm | null;
  showRoute?: boolean;
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

// Baguio-Benguet center as default (all farms are in this region)
const defaultCenter = {
  lat: 16.4023,
  lng: 120.5960,
};

// Light mode map styles - warm earthy tones
const lightMapStyles: google.maps.MapTypeStyle[] = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#a8d5ba" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f5f0e1" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#e8dcc8" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#d4c4a8" }] },
  { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#dbd0b8" }] },
];

// Dark mode map styles - deep earthy dark
const darkMapStyles: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1a1510" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1510" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a7a60" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#2d2518" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2d2518" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#3a3020" }] },
  { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#3a3020" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#4a3d28" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0d2818" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3a6b50" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#201a12" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2d2518" }] },
];

const FarmMap = ({ farms, userLocation, onFarmSelect, selectedFarm, showRoute = false }: FarmMapProps) => {
  const [activeInfoWindow, setActiveInfoWindow] = useState<string | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const hasFittedBounds = useRef(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  // Center on farms region, not user location (farms are all in Baguio-Benguet)
  const center = useMemo(() => defaultCenter, []);

  const mapOptions = useMemo<google.maps.MapOptions>(() => ({
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
    styles: isDark ? darkMapStyles : lightMapStyles,
  }), [isDark]);

  // Apply styles dynamically when theme changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setOptions({ styles: isDark ? darkMapStyles : lightMapStyles });
    }
  }, [isDark]);

  // Zoom-to-fit: adjust bounds to show only farm markers (not user location which may be far away)
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (farms.length > 0 && !hasFittedBounds.current) {
      const bounds = new google.maps.LatLngBounds();
      farms.forEach((farm) => bounds.extend({ lat: farm.latitude, lng: farm.longitude }));
      map.fitBounds(bounds, 40);
      hasFittedBounds.current = true;
    }
  }, [farms]);

  // Re-fit when farms list changes (e.g. filter applied)
  useEffect(() => {
    if (mapRef.current && farms.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      farms.forEach((farm) => bounds.extend({ lat: farm.latitude, lng: farm.longitude }));
      mapRef.current.fitBounds(bounds, 40);
    }
  }, [farms]);

  // Zoom to selected farm when clicking a card
  useEffect(() => {
    if (mapRef.current && selectedFarm) {
      mapRef.current.panTo({ lat: selectedFarm.latitude, lng: selectedFarm.longitude });
      mapRef.current.setZoom(14);
      setActiveInfoWindow(selectedFarm.id);
    }
  }, [selectedFarm]);

  const handleMarkerClick = useCallback((farm: Farm) => {
    setActiveInfoWindow(farm.id);
    onFarmSelect?.(farm);
  }, [onFarmSelect]);

  const calculateRoute = useCallback(async (destination: { lat: number; lng: number }) => {
    if (!userLocation || !window.google) return;

    const directionsService = new google.maps.DirectionsService();
    
    try {
      const result = await directionsService.route({
        origin: userLocation,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      });

      setDirections(result);
      
      if (result.routes[0]?.legs[0]) {
        setRouteInfo({
          distance: result.routes[0].legs[0].distance?.text || "",
          duration: result.routes[0].legs[0].duration?.text || "",
        });
      }
    } catch (error) {
      console.error("Error calculating route:", error);
    }
  }, [userLocation]);

  const handleGetDirections = (farm: Farm) => {
    calculateRoute({ lat: farm.latitude, lng: farm.longitude });
  };

  // Build compact marker SVG with farm name label
  const buildMarkerIcon = (farm: Farm) => {
    const isSelected = selectedFarm?.id === farm.id;
    const pinColor = isDark
      ? (isSelected ? "#6BA539" : "#4A7C23")
      : (isSelected ? "#2D5016" : "#4A7C23");
    const labelBg = isDark ? "#1a1510" : "#FFFFFF";
    const labelText = isDark ? "#e8dcc8" : "#1a1510";
    const borderColor = isDark ? "#3a3020" : "#d4c4a8";
    const shortName = farm.name.length > 14 ? farm.name.substring(0, 12) + "…" : farm.name;

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="52" viewBox="0 0 120 52">
        <rect x="0" y="0" width="120" height="36" rx="8" fill="${labelBg}" stroke="${borderColor}" stroke-width="1.5" opacity="0.95"/>
        <circle cx="16" cy="18" r="10" fill="${pinColor}"/>
        <text x="14" y="22" text-anchor="middle" fill="white" font-size="11" font-weight="bold">🌿</text>
        <text x="32" y="15" fill="${labelText}" font-size="9" font-weight="600" font-family="Inter, sans-serif">${shortName}</text>
        <text x="32" y="28" fill="${isDark ? '#8a7a60' : '#6b5b45'}" font-size="8" font-family="Inter, sans-serif">⭐ ${farm.rating} · ${farm.products.length} items</text>
        <polygon points="20,36 28,36 24,46" fill="${labelBg}" stroke="${borderColor}" stroke-width="1" opacity="0.95"/>
      </svg>
    `;

    return {
      url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(120, 52),
      anchor: new google.maps.Point(24, 52),
    };
  };

  if (loadError) {
    return (
      <div className="h-full flex items-center justify-center bg-secondary rounded-2xl p-8">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-foreground font-medium">Failed to load map</p>
          <p className="text-sm text-muted-foreground mt-1">Please check your connection and try again</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center bg-secondary rounded-2xl">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  // If no API key, show demo mode
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="h-full relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground">Demo Mode – configure API key</p>
        </div>
      </div>
    );
  }

  const activeFarm = activeInfoWindow ? farms.find(f => f.id === activeInfoWindow) : null;

  return (
    <div className="h-full relative rounded-2xl overflow-hidden">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={13}
        options={mapOptions}
        onLoad={onMapLoad}
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#3B82F6",
              fillOpacity: 1,
              strokeColor: isDark ? "#1a1510" : "#FFFFFF",
              strokeWeight: 3,
            }}
          />
        )}

        {/* Farm Markers - compact with labels */}
        {farms.map((farm) => (
          <Marker
            key={farm.id}
            position={{ lat: farm.latitude, lng: farm.longitude }}
            onClick={() => handleMarkerClick(farm)}
            icon={buildMarkerIcon(farm)}
          />
        ))}

        {/* Rich Info Window */}
        {activeFarm && (
          <InfoWindow
            position={{ lat: activeFarm.latitude, lng: activeFarm.longitude }}
            onCloseClick={() => setActiveInfoWindow(null)}
            options={{ maxWidth: 320 }}
          >
            <div style={{ padding: "4px", minWidth: "260px", fontFamily: "Inter, sans-serif" }}>
              <img 
                src={activeFarm.image} 
                alt={activeFarm.name}
                style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }}
              />
              <h4 style={{ fontWeight: 700, fontSize: "15px", color: "#1a1510", margin: "0 0 4px" }}>
                {activeFarm.name}
              </h4>
              <p style={{ fontSize: "12px", color: "#6b5b45", margin: "0 0 6px" }}>
                {activeFarm.owner} · {activeFarm.description.substring(0, 60)}…
              </p>
              <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#4a3d28", marginBottom: "6px" }}>
                <span>⭐ {activeFarm.rating} ({activeFarm.reviewCount})</span>
                <span>📍 {activeFarm.distance ?? "—"} km</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
                {activeFarm.products.slice(0, 4).map((p, i) => (
                  <span key={i} style={{
                    fontSize: "10px", padding: "2px 8px", borderRadius: "999px",
                    background: "#f0ebe0", color: "#4a3d28", border: "1px solid #d4c4a8"
                  }}>{p}</span>
                ))}
                {activeFarm.products.length > 4 && (
                  <span style={{ fontSize: "10px", padding: "2px 8px", color: "#6b5b45" }}>
                    +{activeFarm.products.length - 4} more
                  </span>
                )}
              </div>
              {(activeFarm.farmType || activeFarm.certificate) && (
                <div style={{ display: "flex", gap: "8px", fontSize: "11px", color: "#4A7C23", marginBottom: "8px" }}>
                  {activeFarm.farmType && <span>🌱 {activeFarm.farmType}</span>}
                  {activeFarm.certificate && <span>🏅 {activeFarm.certificate}</span>}
                </div>
              )}
              <button
                onClick={() => handleGetDirections(activeFarm)}
                style={{
                  width: "100%", padding: "8px", background: "#4A7C23", color: "white",
                  border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                🗺️ Get Directions
              </button>
            </div>
          </InfoWindow>
        )}

        {/* Route Display */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                strokeColor: isDark ? "#6BA539" : "#4A7C23",
                strokeWeight: 4,
              },
              suppressMarkers: true,
            }}
          />
        )}
      </GoogleMap>

      {/* Route Info Panel */}
      {routeInfo && (
        <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm rounded-xl p-4 border border-border shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Distance</p>
                  <p className="font-semibold text-foreground">{routeInfo.distance}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Est. Delivery</p>
                  <p className="font-semibold text-foreground">{routeInfo.duration}</p>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setDirections(null);
                setRouteInfo(null);
              }}
            >
              Clear Route
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmMap;