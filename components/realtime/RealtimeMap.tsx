import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { realtimeTrackingService } from '../../services/realtimeTracking';

interface VehicleMarker {
  id: string;
  marker: mapboxgl.Marker;
  popup: mapboxgl.Popup;
}

interface RealtimeMapProps {
  routeId: string;
  initialView?: {
    center: [number, number];
    zoom: number;
  };
  onVehicleSelect?: (vehicle: any) => void;
}

const RealtimeMap: React.FC<RealtimeMapProps> = ({
  routeId,
  initialView = { center: [38.8, 9], zoom: 12 },
  onVehicleSelect,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markers = useRef<Map<string, VehicleMarker>>(new Map());
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: initialView.center,
      zoom: initialView.zoom,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initialView]);

  // Subscribe to vehicle updates
  useEffect(() => {
    if (!mapLoaded || !routeId) return;

    const unsubscribe = realtimeTrackingService.subscribeToVehiclePositions(
      routeId,
      (vehiclePositions) => {
        setVehicles(vehiclePositions);
        updateVehicleMarkers(vehiclePositions);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [mapLoaded, routeId]);

  // Update vehicle markers on the map
  const updateVehicleMarkers = (vehiclePositions: any[]) => {
    if (!map.current) return;

    const existingIds = new Set(vehiclePositions.map((v) => v.vehicleId));

    // Remove markers that are no longer in the list
    markers.current.forEach((marker, id) => {
      if (!existingIds.has(id)) {
        marker.marker.remove();
        markers.current.delete(id);
      }
    });

    // Add or update markers
    vehiclePositions.forEach((vehicle) => {
      const { vehicleId, position } = vehicle;
      const { lat, lng, bearing = 0 } = position;

      if (markers.current.has(vehicleId)) {
        // Update existing marker
        const marker = markers.current.get(vehicleId);
        if (marker) {
          marker.marker.setLngLat([lng, lat]);
          if (bearing !== undefined) {
            marker.marker.setRotation(bearing);
          }
          // Update popup content
          marker.popup.setHTML(getPopupContent(vehicle));
        }
      } else {
        // Create new marker
        const el = document.createElement('div');
        el.className = 'vehicle-marker';
        el.style.backgroundImage = 'url(/bus-icon.png)';
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.backgroundSize = '100%';
        el.style.cursor = 'pointer';

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          getPopupContent(vehicle)
        );

        const marker = new mapboxgl.Marker({
          element: el,
          rotation: bearing,
          rotationAlignment: 'map',
        })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map.current!);

        // Add click handler
        el.addEventListener('click', () => {
          setSelectedVehicle(vehicle);
          if (onVehicleSelect) {
            onVehicleSelect(vehicle);
          }
        });

        markers.current.set(vehicleId, { id: vehicleId, marker, popup });
      }
    });
  };

  const getPopupContent = (vehicle: any) => {
    return `
      <div class="vehicle-popup">
        <h4>Vehicle ${vehicle.vehicleId}</h4>
        <p>Route: ${vehicle.routeId}</p>
        <p>Speed: ${vehicle.position.speed || 'N/A'} km/h</p>
        <p>Last update: ${new Date(vehicle.timestamp).toLocaleTimeString()}</p>
      </div>
    `;
  };

  // Fit map to show all vehicles
  const fitToVehicles = () => {
    if (!map.current || vehicles.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    vehicles.forEach((vehicle) => {
      bounds.extend([vehicle.position.lng, vehicle.position.lat]);
    });

    map.current.fitBounds(bounds, {
      padding: 50,
      maxZoom: 15,
    });
  };

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainer}
        className="w-full h-full rounded-lg shadow-lg"
        style={{ minHeight: '500px' }}
      />
      
      <div className="absolute top-4 right-4 bg-white p-2 rounded shadow-md">
        <h3 className="font-bold mb-2">Vehicles: {vehicles.length}</h3>
        <button
          onClick={fitToVehicles}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Fit to Vehicles
        </button>
      </div>

      {selectedVehicle && (
        <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded shadow-lg max-w-md">
          <h3 className="font-bold">Vehicle Details</h3>
          <p>ID: {selectedVehicle.vehicleId}</p>
          <p>Route: {selectedVehicle.routeId}</p>
          <p>Speed: {selectedVehicle.position.speed || 'N/A'} km/h</p>
          <p>Last update: {new Date(selectedVehicle.timestamp).toLocaleString()}</p>
          <button
            onClick={() => setSelectedVehicle(null)}
            className="mt-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default RealtimeMap;
