'use client';

import GooglePlacesService from './googlePlaces';

export async function syncListingWithGoogle(
  name: string,
  location: string
): Promise<any> {
  return await GooglePlacesService.findParkDetails(name, location);
} 

import GooglePlacesService from './googlePlaces';

export async function syncListingWithGoogle(
  name: string,
  location: string
): Promise<any> {
  return await GooglePlacesService.findParkDetails(name, location);
} 