'use client';

import { Loader } from '@googlemaps/js-api-loader';

// Types for API responses
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
  photos?: google.maps.places.PlacePhoto[];
}

// Service configuration
interface ServiceConfig {
  maxRetries: number;
  retryDelay: number; // milliseconds
}

class GooglePlacesService {
  private static loader: Loader | null = null;
  private static readonly config: ServiceConfig = {
    maxRetries: 3,
    retryDelay: 1000
  };

  private static validateApiKey(): void {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      throw new Error('Google Places API key is not configured');
    }
  }

  private static async getLoader(): Promise<Loader> {
    this.validateApiKey();

    if (!this.loader) {
      this.loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY!,
        version: "weekly",
        libraries: ["places"]
      });
    }
    return this.loader;
  }

  private static async getService(): Promise<google.maps.places.PlacesService> {
    if (typeof window === 'undefined') {
      throw new Error('Google Places Service can only be used in browser environment');
    }

    try {
      const loader = await this.getLoader();
      await loader.load();
      const mapDiv = document.createElement('div');
      return new google.maps.places.PlacesService(mapDiv);
    } catch (error) {
      throw new Error(`Failed to initialize Places service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async retry<T>(
    operation: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retryCount >= this.config.maxRetries) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
      return this.retry(operation, retryCount + 1);
    }
  }

  private static async findPlaceId(
    service: google.maps.places.PlacesService,
    query: string
  ): Promise<string> {
    return this.retry(() => new Promise((resolve, reject) => {
      if (!query.trim()) {
        reject(new Error('Search query cannot be empty'));
        return;
      }

      service.findPlaceFromQuery(
        {
          query,
          fields: ['place_id', 'name']
        },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
            const placeId = results[0].place_id;
            if (!placeId) {
              reject(new Error('Place found but no place_id returned'));
              return;
            }
            resolve(placeId);
          } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            reject(new Error('No places found matching the query'));
          } else {
            reject(new Error(`Place search failed: ${status}`));
          }
        }
      );
    }));
  }

  private static async getPlaceDetails(
    service: google.maps.places.PlacesService,
    placeId: string
  ): Promise<PlaceDetails> {
    return this.retry(() => new Promise((resolve, reject) => {
      if (!placeId.trim()) {
        reject(new Error('Place ID cannot be empty'));
        return;
      }

      service.getDetails(
        {
          placeId,
          fields: [
            'name',
            'place_id',
            'formatted_phone_number',
            'website',
            'url',
            'wheelchair_accessible_entrance',
            'rating',
            'review',
            'user_ratings_total',
            'price_level',
            'photos'
          ]
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            resolve({
              name: place.name || '',
              place_id: placeId,
              formatted_phone_number: place.formatted_phone_number,
              website: place.website,
              url: place.url,
              wheelchair_accessible_entrance: place.wheelchair_accessible_entrance,
              rating: place.rating,
              reviews: place.reviews?.map(review => ({
                author_name: review.author_name,
                rating: review.rating,
                text: review.text || '',
                time: review.time,
                relative_time_description: review.relative_time_description
              })),
              user_ratings_total: place.user_ratings_total,
              price_level: place.price_level,
              photos: place.photos
            });
          } else {
            reject(new Error(`Failed to get place details: ${status}`));
          }
        }
      );
    }));
  }

  static async findParkDetails(name: string, location: string): Promise<PlaceDetails | null> {
    if (!name.trim() || !location.trim()) {
      console.error('Name and location are required');
      return null;
    }

    try {
      const service = await this.getService();
      const placeId = await this.findPlaceId(service, `${name} ${location}`);
      return await this.getPlaceDetails(service, placeId);
    } catch (error) {
      console.error('Error in findParkDetails:', 
        error instanceof Error ? error.message : 'Unknown error'
      );
      return null;
    }
  }
}

export default GooglePlacesService; 