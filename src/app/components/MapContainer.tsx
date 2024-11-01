'use client';

import { useState, useEffect } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Listing {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  units?: number;
  noi?: number;
  cap_rate?: number;
  google_rating?: number;
  google_total_reviews?: number;
}

export default function MapContainer() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [viewState, setViewState] = useState({
    latitude: 39.8283,
    longitude: -98.5795,
    zoom: 4
  });

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch('/api/listings');
        if (!response.ok) throw new Error('Failed to fetch listings');
        const data = await response.json();
        setListings(data);
        setIsLoaded(true);
      } catch (error) {
        console.error('Error fetching listings:', error);
      }
    };

    fetchListings();
  }, []);

  const formatCapRate = (capRate: number | null) => {
    if (!capRate) return 'N/A';
    return `${Number(capRate).toFixed(2)}%`;
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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

  if (!isLoaded) return null;

  return (
    <div className="h-screen w-full">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        minZoom={3}
        maxZoom={15}
      >
        {listings.map(listing => (
          <Marker
            key={listing.id}
            latitude={listing.latitude}
            longitude={listing.longitude}
            onClick={e => {
              e.originalEvent.stopPropagation();
              setSelectedListing(listing);
            }}
          >
            <div className="cursor-pointer text-2xl">📍</div>
          </Marker>
        ))}

        {selectedListing && (
          <Popup
            latitude={selectedListing.latitude}
            longitude={selectedListing.longitude}
            onClose={() => setSelectedListing(null)}
            closeButton={true}
            closeOnClick={false}
            className="min-w-[200px]"
          >
            <div className="p-2">
              <h3 className="font-bold mb-1">{selectedListing.name}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {selectedListing.city}, {selectedListing.state}
              </p>
              
              <p className="text-sm">
                Units: {selectedListing.total_units || 'N/A'}
              </p>
              
              <p className="text-sm">
                NOI: {formatCurrency(selectedListing.net_operating_income)}
              </p>
              
              <p className="text-sm">
                Cap Rate: {formatCapRate(selectedListing.cap_rate)}
              </p>

              {selectedListing.asking_price && (
                <p className="text-sm">
                  Asking Price: {formatCurrency(selectedListing.asking_price)}
                </p>
              )}

              {selectedListing.google_rating && (
                <div className="mt-2">
                  {renderStars(selectedListing.google_rating)}
                  <p className="text-sm text-gray-600">
                    Based on {selectedListing.google_total_reviews} reviews
                  </p>
                </div>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}