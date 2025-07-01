import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// Dynamically import the map component to avoid SSR issues with mapbox-gl
const RealtimeMap = dynamic(
  () => import('../../components/realtime/RealtimeMap'),
  { ssr: false }
);

const VehicleETA = dynamic(
  () => import('../../components/realtime/VehicleETA'),
  { ssr: false }
);

// Sample route data - in a real app, fetch this from your API
const ROUTE_DATA = {
  'route-1': {
    name: 'Bole - Mexico',
    stops: [
      { id: 'stop-1', name: 'Bole Main Road', position: { lat: 9.0331, lng: 38.7501 } },
      { id: 'stop-2', name: 'Megenagna', position: { lat: 9.0300, lng: 38.7800 } },
      { id: 'stop-3', name: 'Mexico Square', position: { lat: 9.0200, lng: 38.8000 } },
    ],
    center: [38.7751, 9.0100],
  },
  // Add more routes as needed
};

const RealtimeRoutePage: React.FC = () => {
  const router = useRouter();
  const { routeId } = router.query;
  const [selectedStop, setSelectedStop] = useState<string | null>(null);
  
  // Get route data
  const route = routeId ? ROUTE_DATA[routeId as keyof typeof ROUTE_DATA] : null;
  
  if (!route) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Route not found</h1>
          <p className="text-gray-600">The requested route could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{route.name} - Real-time Tracking | Sheger Transit</title>
        <meta name="description" content={`Real-time tracking for ${route.name} route`} />
      </Head>

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {route.name} - Real-time Tracking
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
            <div className="h-[600px] w-full">
              <RealtimeMap
                routeId={routeId as string}
                initialView={{
                  center: route.center as [number, number],
                  zoom: 12,
                }}
                onVehicleSelect={(vehicle) => {
                  // Handle vehicle selection if needed
                  console.log('Selected vehicle:', vehicle);
                }}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Route Info */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-medium mb-3">Route Information</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Route:</span> {route.name}</p>
                <p><span className="font-medium">Status:</span> <span className="text-green-600">Active</span></p>
                <p><span className="font-medium">Vehicles:</span> 3 on route</p>
              </div>
            </div>

            {/* Stops List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <h2 className="text-lg font-medium p-4 border-b">Stops</h2>
              <ul className="divide-y">
                {route.stops.map((stop) => (
                  <li 
                    key={stop.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedStop === stop.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedStop(stop.id === selectedStop ? null : stop.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{stop.name}</h3>
                        <p className="text-sm text-gray-500">
                          {stop.position.lat.toFixed(4)}, {stop.position.lng.toFixed(4)}
                        </p>
                      </div>
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    </div>
                    
                    {selectedStop === stop.id && (
                      <div className="mt-3 pt-3 border-t">
                        <VehicleETA 
                          routeId={routeId as string}
                          stopId={stop.id}
                          stopPosition={stop.position}
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-medium mb-3">Service Alerts</h2>
              <div className="text-sm text-gray-600">
                <p>• No current service alerts</p>
                <p>• All vehicles running on time</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RealtimeRoutePage;
