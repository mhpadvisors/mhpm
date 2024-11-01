'use client';

import { useState } from 'react';

export default function ReviewSync() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [listingId, setListingId] = useState('');

  const syncListing = async (id?: string) => {
    if (id && isNaN(Number(id))) {
      setStatus('Please enter a valid listing ID');
      return;
    }

    setLoading(true);
    setStatus('Syncing...');

    try {
      const response = await fetch('/api/reviews/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          listingId: id ? Number(id) : undefined 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus(id ? 
          `Successfully synced listing ${id}` : 
          'Successfully synced all listings'
        );
      } else {
        setStatus(`Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 fixed top-0 right-0 bg-white z-50 shadow-lg rounded-lg m-4">
      <div className="space-y-2">
        <div>
          <input
            type="number"
            value={listingId}
            onChange={(e) => setListingId(e.target.value)}
            placeholder="Enter listing ID"
            className="w-full p-2 border rounded mb-2"
          />
          <button
            onClick={() => syncListing(listingId)}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded block w-full disabled:opacity-50"
          >
            Sync Single Listing
          </button>
        </div>
        
        <button
          onClick={() => syncListing()}
          disabled={loading}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded block w-full disabled:opacity-50"
        >
          Sync All Listings
        </button>
      </div>
      
      {status && (
        <div className={`mt-2 text-sm ${status.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
          {status}
        </div>
      )}
    </div>
  );
} 