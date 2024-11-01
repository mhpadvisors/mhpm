'use client';

import { useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export default function TestPlaces() {
  const [status, setStatus] = useState('');
  const [result, setResult] = useState<any>(null);

  const testAPI = async () => {
    setStatus('Loading...');
    try {
      // Initialize Google Maps loader
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY!,
        version: "weekly",
        libraries: ["places"]
      });

      await loader.load();
      
      // Create PlacesService (requires a div element)
      const mapDiv = document.createElement('div');
      const service = new google.maps.places.PlacesService(mapDiv);

      // Test search for a sample park
      service.findPlaceFromQuery(
        {
          query: "Bonny Brook Mobile Home Park Erie PA",
          fields: ['name', 'place_id', 'formatted_address']
        },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setResult(results[0]);
            setStatus('Success!');
          } else {
            setStatus(`Error: ${status}`);
          }
        }
      );

    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-4 fixed top-0 left-0 bg-white z-50 shadow-lg rounded-lg m-4">
      <button 
        onClick={testAPI}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Test Places API
      </button>
      
      <div className="mt-2">Status: {status}</div>
      
      {result && (
        <div className="mt-2">
          <h3 className="font-bold">Result:</h3>
          <pre className="bg-gray-100 p-2 rounded mt-1 text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}