'use client';

import { useState } from 'react';
import GooglePlacesService from '../services/googlePlaces';

export default function TestPlaces() {
  const [status, setStatus] = useState('');
  const [parkDetails, setParkDetails] = useState<any>(null);

  const testService = async () => {
    setStatus('Loading...');
    try {
      const details = await GooglePlacesService.findParkDetails(
        'Bonny Brook Mobile Home Park',
        'Erie, PA'
      );
      
      if (details) {
        setParkDetails(details);
        setStatus('Success!');
      } else {
        setStatus('No results found');
      }
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getPriceLevel = (level?: number) => {
    if (level === undefined) return 'Not available';
    return '$'.repeat(level + 1);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-400">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-400">½</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300">★</span>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 fixed top-0 left-0 bg-white z-50 shadow-lg rounded-lg m-4 max-w-lg overflow-auto max-h-[90vh]">
      <button 
        onClick={testService}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Test Places Service
      </button>
      
      <div className="mt-2">Status: {status}</div>
      
      {parkDetails && (
        <div className="mt-4 space-y-4">
          <h2 className="text-xl font-bold">{parkDetails.name}</h2>
          
          <div className="space-y-2">
            {parkDetails.formatted_phone_number && (
              <p>📞 <a href={`tel:${parkDetails.formatted_phone_number}`} className="text-blue-600 hover:underline">
                {parkDetails.formatted_phone_number}
              </a></p>
            )}
            
            {parkDetails.website && (
              <p>🌐 <a href={parkDetails.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Website
              </a></p>
            )}
            
            {parkDetails.url && (
              <p>📍 <a href={parkDetails.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                View on Google Maps
              </a></p>
            )}
            
            <p>♿ Wheelchair Accessible: {parkDetails.wheelchair_accessible_entrance ? 'Yes' : 'No information available'}</p>
            
            <p>💰 Price Level: {getPriceLevel(parkDetails.price_level)}</p>
          </div>

          {parkDetails.rating && (
            <div className="mt-4">
              {renderStars(parkDetails.rating)}
              <p className="text-sm text-gray-600 mt-1">
                Based on {parkDetails.user_ratings_total} reviews
              </p>
            </div>
          )}

          {parkDetails.reviews && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Recent Reviews</h3>
              <div className="space-y-4">
                {parkDetails.reviews.map((review: any, index: number) => (
                  <div key={index} className="border-b pb-2">
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-sm mt-1">{review.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {review.relative_time_description || new Date(review.time * 1000).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}