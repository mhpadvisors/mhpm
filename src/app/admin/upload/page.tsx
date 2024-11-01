'use client';

import { useState } from 'react';

export default function UploadPage() {
  const [status, setStatus] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('Uploading...');

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch('/api/upload-listings', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setStatus(`Success! Imported ${result.stats.imported} listings`);
      } else {
        setStatus(`Error: ${result.error}`);
      }

    } catch (error) {
      setStatus(`Error: ${error}`);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Upload Listings CSV</h1>
      
      <form onSubmit={handleSubmit}>
        <input 
          type="file" 
          name="file" 
          accept=".csv"
          className="mb-4 block"
          required 
        />
        
        <button 
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Upload
        </button>
      </form>

      {status && (
        <div className="mt-4">
          {status}
        </div>
      )}
    </div>
  );
} 