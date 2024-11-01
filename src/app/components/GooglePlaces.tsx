'use client';

import { useState } from 'react';
import GooglePlacesService from '../services/googlePlaces';

interface PlaceReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  relative_time_description?: string;
}

interface PlaceDetails {
  name: string;
  place_id: string;
  formatted_phone_number?: string;
  website?: string;
  url?: string;
  wheelchair_accessible_entrance?: boolean;
  rating?: number;
  reviews?: PlaceReview[];
  user_ratings_total?: number;
  price_level?: number;
}

export default function GooglePlaces() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [parkDetails, setParkDetails] = useState<PlaceDetails | null>(null);

  const renderStars = (rating: number): JSX.Element => {
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

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const testService = async (): Promise<void> => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 fixed top-0 left-0 bg-white z-50 shadow-lg rounded-lg m-4 max-w-lg overflow-auto max-h-[90vh]">
      <button 
        onClick={testService}
        disabled={loading}
        className={`
          bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {loading ? 'Testing...' : 'Test Places Service'}
      </button>
      
      <div className={`mt-2 ${status.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
        {status}
      </div>
      
      {parkDetails && (
        <div className="mt-4 space-y-4">
          <h2 className="text-xl font-bold">{parkDetails.name}</h2>
          
          {parkDetails.formatted_phone_number && (
            <p className="flex items-center gap-2">
              <span className="text-gray-500">📞</span>
              <a 
                href={`tel:${parkDetails.formatted_phone_number}`}
                className="text-blue-600 hover:underline"
              >
                {parkDetails.formatted_phone_number}
              </a>
            </p>
          )}
          
          {parkDetails.website && (
            <p className="flex items-center gap-2">
              <span className="text-gray-500">🌐</span>
              <a 
                href={parkDetails.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Website
              </a>
            </p>
          )}
          
          {parkDetails.url && (
            <p className="flex items-center gap-2">
              <span className="text-gray-500">📍</span>
              <a 
                href={parkDetails.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View on Google Maps
              </a>
            </p>
          )}

          {parkDetails.rating && (
            <div className="mt-2">
              {renderStars(parkDetails.rating)}
              <p className="text-sm text-gray-600 mt-1">
                Based on {parkDetails.user_ratings_total} reviews
              </p>
            </div>
          )}

          {parkDetails.reviews && parkDetails.reviews.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Recent Reviews</h3>
              <div className="space-y-4">
                {parkDetails.reviews.map((review, index) => (
                  <div key={index} className="border-b pb-2">
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-sm mt-1">{review.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {review.relative_time_description || formatDate(review.time)}
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