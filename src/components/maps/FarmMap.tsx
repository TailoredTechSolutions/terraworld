import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsRenderer } from "@react-google-maps/api";
import { Farm } from "@/data/products";
import { MapPin, Star, Navigation, Clock, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GOOGLE_MAPS_API_KEY } from "@/config/maps";

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

// Manila center as default
const defaultCenter = {
  lat: 14.5995,
  lng: 120.9842,
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#a8d5ba" }],
    },
    {
      featureType: "landscape",
      elementType: "geometry",
      stylers: [{ color: "#f5f5dc" }],
    },
  ],
};

// API key is imported from config/maps.ts

const FarmMap = ({ farms, userLocation, onFarmSelect, selectedFarm, showRoute = false }: FarmMapProps) => {
  const [activeInfoWindow, setActiveInfoWindow] = useState<string | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const hasFittedBounds = useRef(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const center = useMemo(() => userLocation || defaultCenter, [userLocation]);

  // Zoom-to-fit: adjust bounds to show all farm markers + user location
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (farms.length > 0 && !hasFittedBounds.current) {
      const bounds = new google.maps.LatLngBounds();
      farms.forEach((farm) => bounds.extend({ lat: farm.latitude, lng: farm.longitude }));
      if (userLocation) bounds.extend(userLocation);
      map.fitBounds(bounds, 40);
      hasFittedBounds.current = true;
    }
  }, [farms, userLocation]);

  // Re-fit when farms change
  useEffect(() => {
    if (mapRef.current && farms.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      farms.forEach((farm) => bounds.extend({ lat: farm.latitude, lng: farm.longitude }));
      if (userLocation) bounds.extend(userLocation);
      mapRef.current.fitBounds(bounds, 40);
    }
  }, [farms, userLocation]);

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

  // Handle route calculation when farm is selected
  const handleGetDirections = (farm: Farm) => {
    calculateRoute({ lat: farm.latitude, lng: farm.longitude });
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
        {/* Demo Map Background */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="demo-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#demo-grid)" />
          </svg>
        </div>

        {/* Demo Farm Markers */}
        <div className="absolute inset-0 p-8">
          {farms.map((farm, index) => (
            <div
              key={farm.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{
                left: `${20 + (index % 3) * 30}%`,
                top: `${25 + Math.floor(index / 3) * 35}%`,
              }}
              onClick={() => handleMarkerClick(farm)}
            >
              <div className={`
                relative p-2 rounded-full shadow-lg transition-all
                ${activeInfoWindow === farm.id ? 'bg-primary scale-125' : 'bg-white group-hover:scale-110'}
              `}>
                <MapPin className={`h-6 w-6 ${activeInfoWindow === farm.id ? 'text-primary-foreground' : 'text-primary'}`} />
              </div>
              
              {activeInfoWindow === farm.id && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-card rounded-xl shadow-xl border border-border p-4 z-10">
                  <img src={farm.image} alt={farm.name} className="w-full h-24 object-cover rounded-lg mb-3" />
                  <h4 className="font-display font-semibold text-foreground">{farm.name}</h4>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span>{farm.rating}</span>
                    <span>•</span>
                    <span>{farm.distance} km away</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1 btn-primary-gradient rounded-lg text-xs">
                      <Navigation className="h-3 w-3 mr-1" />
                      Directions
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 rounded-lg text-xs">
                      View Farm
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* User Location Marker */}
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: "50%", top: "50%" }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-25" />
              <div className="relative h-4 w-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
            </div>
          </div>
        </div>

        {/* Demo Mode Banner */}
        <div className="absolute top-4 left-4 right-4 bg-card/95 backdrop-blur-sm rounded-xl p-4 border border-border shadow-lg">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Demo Mode</h4>
              <p className="text-sm text-muted-foreground">
                Add your Google Maps API key to enable real-time routing. Click on farm markers to see details.
              </p>
            </div>
          </div>
        </div>

        {/* Delivery Info Panel */}
        <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Avg. Delivery:</span>
                <span className="font-medium">45-60 min</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Fee:</span>
                <span className="font-medium">₱45 - ₱85</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{farms.length} farms nearby</span>
          </div>
        </div>
      </div>
    );
  }

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
              strokeColor: "#FFFFFF",
              strokeWeight: 3,
            }}
          />
        )}

        {/* Farm Markers */}
        {farms.map((farm) => (
          <Marker
            key={farm.id}
            position={{ lat: farm.latitude, lng: farm.longitude }}
            onClick={() => handleMarkerClick(farm)}
            icon={{
              url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
                  <path d="M20 0C9 0 0 9 0 20c0 11 20 28 20 28s20-17 20-28C40 9 31 0 20 0z" fill="${selectedFarm?.id === farm.id ? '#2D5016' : '#4A7C23'}"/>
                  <circle cx="20" cy="18" r="10" fill="white"/>
                  <path d="M20 12c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6z" fill="${selectedFarm?.id === farm.id ? '#2D5016' : '#4A7C23'}"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(40, 48),
              anchor: new google.maps.Point(20, 48),
            }}
          />
        ))}

        {/* Info Window */}
        {activeInfoWindow && farms.find(f => f.id === activeInfoWindow) && (
          <InfoWindow
            position={{
              lat: farms.find(f => f.id === activeInfoWindow)!.latitude,
              lng: farms.find(f => f.id === activeInfoWindow)!.longitude,
            }}
            onCloseClick={() => setActiveInfoWindow(null)}
          >
            <div className="p-2 min-w-[200px]">
              <img 
                src={farms.find(f => f.id === activeInfoWindow)!.image} 
                alt={farms.find(f => f.id === activeInfoWindow)!.name}
                className="w-full h-24 object-cover rounded-lg mb-2"
              />
              <h4 className="font-semibold text-gray-900">
                {farms.find(f => f.id === activeInfoWindow)!.name}
              </h4>
              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                <span>⭐ {farms.find(f => f.id === activeInfoWindow)!.rating}</span>
                <span>•</span>
                <span>{farms.find(f => f.id === activeInfoWindow)!.distance} km</span>
              </div>
              <button
                onClick={() => handleGetDirections(farms.find(f => f.id === activeInfoWindow)!)}
                className="mt-2 w-full px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                Get Directions
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
                strokeColor: "#4A7C23",
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