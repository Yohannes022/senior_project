import React, { useEffect, useState } from 'react';
import { realtimeTrackingService } from '../../services/realtimeTracking';

interface VehicleETAProps {
  routeId: string;
  stopId: string;
  stopPosition: {
    lat: number;
    lng: number;
  };
  updateInterval?: number;
}

interface ETAInfo {
  vehicleId: string;
  eta: number; // in minutes
  distance: number; // in km
  lastUpdate: Date;
}

const VehicleETA: React.FC<VehicleETAProps> = ({
  routeId,
  stopId,
  stopPosition,
  updateInterval = 30000, // 30 seconds
}) => {
  const [etas, setEtas] = useState<ETAInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let timer: ReturnType<typeof setTimeout>;

    const fetchETAs = async () => {
      try {
        setLoading(true);
        
        // Get vehicles for this route
        const vehicles = await realtimeTrackingService.getVehiclesInRadius(
          stopPosition,
          10 // 10km radius
        );

        // Filter vehicles for this route and calculate ETAs
        const routeVehicles = vehicles.filter(v => v.routeId === routeId);
        const etaData = routeVehicles.map(vehicle => {
          const distance = calculateDistance(
            vehicle.position.lat,
            vehicle.position.lng,
            stopPosition.lat,
            stopPosition.lng
          );
          
          // Simple ETA calculation (distance / speed)
          // In a real app, use a routing service for more accurate ETAs
          const speed = vehicle.position.speed || 30; // default to 30 km/h if speed not available
          const eta = (distance / speed) * 60; // in minutes
          
          return {
            vehicleId: vehicle.vehicleId,
            eta: Math.round(eta * 10) / 10, // round to 1 decimal
            distance: Math.round(distance * 10) / 10, // round to 1 decimal
            lastUpdate: new Date(vehicle.timestamp)
          };
        });

        // Sort by ETA
        etaData.sort((a, b) => a.eta - b.eta);

        if (isMounted) {
          setEtas(etaData);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching ETA:', err);
        if (isMounted) {
          setError('Failed to load ETA data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          // Schedule next update
          timer = setTimeout(fetchETAs, updateInterval);
        }
      }
    };

    // Initial fetch
    fetchETAs();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [routeId, stopId, stopPosition, updateInterval]);

  // Haversine distance calculation
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const toRad = (value: number): number => {
    return value * Math.PI / 180;
  };

  if (loading) {
    return <div className="p-4 text-center">Loading ETA data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (etas.length === 0) {
    return <div className="p-4 text-gray-500">No vehicles currently on this route</div>;
  }

  return (
    <div className="space-y-2 p-4">
      <h3 className="font-bold text-lg mb-2">Next Arrivals</h3>
      <div className="space-y-2">
        {etas.map((etaInfo) => (
          <div key={etaInfo.vehicleId} className="bg-gray-50 p-3 rounded-lg shadow">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Vehicle {etaInfo.vehicleId}</div>
                <div className="text-sm text-gray-500">
                  {etaInfo.distance} km away
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-600">
                  {etaInfo.eta} min
                </div>
                <div className="text-xs text-gray-400">
                  Updated {formatRelativeTime(etaInfo.lastUpdate)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-400 mt-2 text-right">
        Updates every {updateInterval / 1000} seconds
      </div>
    </div>
  );
};

// Helper function to format relative time (e.g., "2 minutes ago")
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }
  
  return date.toLocaleString();
};

export default VehicleETA;
