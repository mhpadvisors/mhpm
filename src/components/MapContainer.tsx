'use client';
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Debug: Log when component loads
console.log('MapContainer component loading');

// Debug: Check if mapboxgl is available
console.log('mapboxgl:', mapboxgl);

const mapboxToken = 'pk.eyJ1IjoibWhwYWR2aXNvcnMiLCJhIjoiY20ydzQ2a24zMDJxeDJqcHpqZ3AzNG94dCJ9.is-MFJM98XTwjTkGyOvAIg';

const MapContainer = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng] = useState(-98.5795);
  const [lat] = useState(39.8283);
  const [zoom] = useState(4);

  useEffect(() => {
    try {
      mapboxgl.accessToken = mapboxToken;

      if (!mapContainer.current) return;

      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [lng, lat],
        zoom: zoom,
        antialias: true
      });

      map.current = mapInstance;

      return () => {
        map.current?.remove();
      };
    } catch (error) {
      console.error('Map initialization error:', error);
    }
  }, [lat, lng, zoom]);

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-gray-200">
      <div 
        ref={mapContainer} 
        className="absolute inset-0" 
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default MapContainer;