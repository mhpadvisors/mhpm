'use client';
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapContainer = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng] = useState(-98.5795);
  const [lat] = useState(39.8283);
  const [zoom] = useState(4);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapContainer.current) return;

    const initializeMap = async () => {
      try {
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

        const mapInstance = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [lng, lat],
          zoom: zoom,
          antialias: true
        });

        map.current = mapInstance;

        mapInstance.on('load', () => {
          setIsLoading(false);
        });

      } catch (error) {
        console.error('Map initialization error:', error);
        setIsLoading(false);
      }
    };

    initializeMap();

    return () => {
      map.current?.remove();
    };
  }, [lat, lng, zoom]);

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-gray-200">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <span>Loading map...</span>
        </div>
      )}
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default MapContainer;