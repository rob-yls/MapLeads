/**
 * Google Maps API Client for MapLeads
 * 
 * This file contains functions for interacting with the Google Maps API.
 * It provides a clean interface for searching businesses and fetching details.
 */

import type { Business } from '../types/database';

// Google Maps API Types
export interface GoogleMapsPlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  address_components?: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    }
  };
  vicinity?: string;
  types?: string[];
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  photos?: {
    photo_reference: string;
    height: number;
    width: number;
    html_attributions: string[];
  }[];
  opening_hours?: {
    open_now?: boolean;
    periods?: {
      open: {
        day: number;
        time: string;
      };
      close: {
        day: number;
        time: string;
      };
    }[];
    weekday_text?: string[];
  };
  website?: string;
  reservation_url?: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  editorial_summary?: {
    overview: string;
    language: string;
  };
}

export interface GoogleMapsSearchResponse {
  results: GoogleMapsPlaceResult[];
  next_page_token?: string;
  status: string;
  error_message?: string;
}

export interface GoogleMapsPlaceDetailsResponse {
  result: GoogleMapsPlaceResult;
  status: string;
  error_message?: string;
}

// Error class for Google Maps API errors
export class GoogleMapsError extends Error {
  status: string;
  
  constructor(message: string, status: string) {
    super(message);
    this.name = 'GoogleMapsError';
    this.status = status;
  }
}

/**
 * Google Maps API Service
 */
export const googleMapsService = {
  /**
   * Search for businesses using the Google Maps Places API
   */
  searchBusinesses: async (
    query: string, 
    location: string, 
    radius: number = 5000, 
    type?: string,
    pageToken?: string
  ): Promise<{ results: Partial<Business>[], nextPageToken?: string }> => {
    // Validate API key
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key is not configured in environment variables');
      throw new Error('Google Maps API key is not configured');
    }
    
    // Log API request for debugging (without exposing the full API key)
    const maskedKey = apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 5);
    console.log(`Making Google Maps API request with key: ${maskedKey}`);
    
    // For Places API, we need to properly format the query to include the location
    // Instead of using the location parameter which doesn't work as expected
    const formattedQuery = type 
      ? `${query} ${type} in ${location}`
      : `${query} in ${location}`;
    
    console.log(`[Google Maps] Formatted query: ${formattedQuery}`);
    
    // Construct the API URL
    const baseUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
    const url = new URL(baseUrl);
    url.searchParams.append('query', formattedQuery);
    url.searchParams.append('radius', radius.toString());
    url.searchParams.append('key', apiKey);
    
    if (pageToken) {
      url.searchParams.append('pagetoken', pageToken);
    }
    
    try {
      // Make the API request with cache disabled
      const response = await fetch(url.toString(), {
        cache: 'no-store',
        next: { revalidate: 0 } // Disable caching
      });
      
      if (!response.ok) {
        console.error(`Google Maps API request failed with status: ${response.status} ${response.statusText}`);
        throw new Error(`Google Maps API request failed: ${response.statusText}`);
      }
      
      const data: GoogleMapsSearchResponse = await response.json();
      
      // Log the raw API response for debugging
      console.log(`[Google Maps] API returned ${data.results.length} results`);
      
      // Handle API errors
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error(`Google Maps API returned error status: ${data.status}`, data.error_message || 'No error message provided');
        throw new GoogleMapsError(`Google Maps API error: ${data.status}${data.error_message ? ` - ${data.error_message}` : ''}`, data.status);
      }
    
      // Fetch details for places to get phone and website information
      const detailedResults: Partial<Business>[] = [];
      
      if (data.results.length > 0) {
        // Process a limited number of results to avoid rate limiting
        const MAX_DETAILS = 10;
        const resultsToProcess = Math.min(data.results.length, MAX_DETAILS);
        
        console.log(`[Google Maps] Fetching details for ${resultsToProcess} places`);
        
        for (let i = 0; i < resultsToProcess; i++) {
          const place = data.results[i];
          try {
            // Fetch detailed place info for phone and website
            const details = await googleMapsService.getBusinessDetails(place.place_id);
            detailedResults.push(details);
          } catch (error) {
            console.error(`Error fetching details for place ${place.place_id}:`, error);
            // Fall back to using the basic place information
            detailedResults.push(transformPlaceToBusinessPartial(place));
          }
        }
        
        // Process remaining results with partial info only
        if (data.results.length > MAX_DETAILS) {
          const remainingResults = data.results.slice(MAX_DETAILS).map(place => 
            transformPlaceToBusinessPartial(place)
          );
          detailedResults.push(...remainingResults);
        }
      }
      
      return {
        results: detailedResults,
        nextPageToken: data.next_page_token
      };
    } catch (error) {
      console.error('Error in Google Maps API request:', error);
      throw error;
    }
  },
  
  /**
   * Get detailed information about a business using its place_id
   */
  async getBusinessDetails(placeId: string): Promise<Business> {
    if (!placeId) {
      console.error('getBusinessDetails called with empty placeId');
      throw new Error('Place ID is required');
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key is not configured');
    }

    try {
      // Include all the fields we need in the request
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,place_id,formatted_address,address_components,formatted_phone_number,international_phone_number,website,editorial_summary,opening_hours,types,rating,user_ratings_total,price_level&key=${apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`Google Maps Details API request failed with status: ${response.status} ${response.statusText}`);
        throw new Error(`Google Maps API request failed: ${response.statusText}`);
      }
      
      const data = await response.json() as GoogleMapsPlaceDetailsResponse;
      
      // Handle API errors
      if (data.status !== 'OK') {
        console.error(`Google Maps Details API returned error status: ${data.status}`, data.error_message || 'No error message provided');
        throw new GoogleMapsError(`Google Maps API error: ${data.status}${data.error_message ? ` - ${data.error_message}` : ''}`, data.status);
      }
      
      if (!data.result) {
        console.error('Google Maps API returned OK status but no result object');
        throw new Error('No result data returned from Google Maps API');
      }
      
      // Transform the result to our Business type
      const business = transformPlaceToBusinessFull(data.result);
      
      return business;
    } catch (error) {
      console.error('Error fetching business details:', error);
      throw error;
    }
  },
  
  /**
   * Get a photo URL from a photo reference
   */
  getPhotoUrl: (photoReference: string, maxWidth: number = 400): string => {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key is not configured');
    }
    
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${apiKey}`;
  }
};

/**
 * Generate a UUID for use as an ID
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Transform a Google Maps place result to a partial Business object
 */
export function transformPlaceToBusinessPartial(place: GoogleMapsPlaceResult): Partial<Business> {
  // Format the business categories from the place types
  const categories = place.types?.map(type => formatCategory(type)) || [];
  
  // Create the base business object
  const baseBusiness: Partial<Business> = {
    id: place.place_id || generateUUID(),
    google_place_id: place.place_id,
    name: place.name,
    latitude: place.geometry?.location.lat,
    longitude: place.geometry?.location.lng,
    category: categories[0],
    categories: categories,
    rating: place.rating,
    review_count: place.user_ratings_total,
    price_level: place.price_level,
    phone: place.formatted_phone_number || place.international_phone_number || undefined,
    website: place.website || undefined,
    email: undefined, // Google Places API doesn't provide email addresses
    description: place.editorial_summary?.overview || place.types?.map(type => formatCategory(type)).join(', ') || undefined,
    googleMapUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
  };
  
  return baseBusiness;
}

/**
 * Transform a Google Maps place result to a full Business object
 */
export function transformPlaceToBusinessFull(place: GoogleMapsPlaceResult): Business {
  // Start with the partial business data
  const baseBusiness = transformPlaceToBusinessPartial(place);
  
  // Extract address components
  let street = '';
  let address2 = undefined;
  let city = '';
  let state = '';
  let postalCode = '';
  let country = '';
  
  // Process address components if available
  if (place.address_components && place.address_components.length > 0) {
    for (const component of place.address_components) {
      const types = component.types;
      
      if (types.includes('street_number')) {
        street = component.long_name;
      } else if (types.includes('route')) {
        street = street ? `${street} ${component.long_name}` : component.long_name;
      } else if (types.includes('subpremise')) {
        address2 = component.long_name;
      } else if (types.includes('locality') || types.includes('sublocality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.short_name;
      } else if (types.includes('postal_code')) {
        postalCode = component.long_name;
      } else if (types.includes('country')) {
        country = component.long_name;
      }
    }
  } else if (place.formatted_address) {
    // Fallback to parsing the formatted address if components aren't available
    const parts = place.formatted_address.split(',').map(p => p.trim());
    if (parts.length >= 3) {
      street = parts[0];
      city = parts[1];
      const stateZip = parts[2].split(' ');
      if (stateZip.length >= 2) {
        state = stateZip[0];
        postalCode = stateZip[1];
      }
      if (parts.length > 3) {
        country = parts[3];
      }
    }
  }
  
  // Create the full business object with address information
  return {
    ...baseBusiness,
    formatted_address: place.formatted_address || '',
    address: street || '',
    address2: address2,
    city: city || '',
    state: state || '',
    postal_code: postalCode || '',
    country: country || 'USA',
    phone: place.formatted_phone_number || place.international_phone_number || undefined,
    email: undefined, // Google Places API doesn't provide email addresses
    website: place.website || undefined,
    description: place.editorial_summary?.overview || place.types?.map(type => formatCategory(type)).join(', ') || undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_fetched: new Date().toISOString(),
    googleMapUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
  } as Business;
}

/**
 * Helper function to parse address components from a formatted address
 */
function parseAddressComponents(formattedAddress: string): { 
  streetNumber: string; 
  streetName: string;
  city: string; 
  state: string; 
  postalCode: string; 
  country: string;
} {
  // Default values
  const result = {
    streetNumber: '',
    streetName: '',
    city: 'Unknown',
    state: 'Unknown',
    postalCode: 'Unknown',
    country: 'Unknown'
  };
  
  // Simple parsing logic - this is a basic implementation
  // For production, consider using a more robust address parser
  const parts = formattedAddress.split(',').map(part => part.trim());
  
  if (parts.length >= 1) {
    // Check if the first part contains multiple components (like street number and name)
    const addressParts = parts[0].split(' ');
    
    // Check if there might be an address2 component (like "First Floor" or "Suite 100")
    const potentialAddress2Indicators = ['floor', 'suite', 'apt', 'unit', '#', 'ste', 'apartment'];
    
    // Find where the address2 component might start
    let address2StartIndex = -1;
    for (let i = 0; i < addressParts.length; i++) {
      const part = addressParts[i].toLowerCase();
      if (potentialAddress2Indicators.some(indicator => part.includes(indicator))) {
        address2StartIndex = i;
        break;
      }
    }
    
    if (address2StartIndex > 0) {
      // We found an address2 component
      result.streetNumber = addressParts.slice(0, address2StartIndex).join(' ');
      result.streetName = addressParts.slice(address2StartIndex).join(' ');
    } else {
      result.streetNumber = addressParts[0];
      result.streetName = addressParts.slice(1).join(' ');
    }
  }
  
  if (parts.length >= 2) {
    // If we have an address2 component but no address, move address2 to address
    if (!result.streetNumber && result.streetName) {
      result.streetNumber = result.streetName;
      result.streetName = '';
    }
    
    // If the second part doesn't look like a city (contains numbers), it might be address2
    if (parts[1].match(/\d/) && result.streetName === '') {
      result.streetName = parts[1];
    } else {
      result.city = parts[1];
    }
  }
  
  if (parts.length >= 3) {
    // If we didn't set the city yet, use the third part
    if (result.city === 'Unknown' && !parts[2].match(/\d/)) {
      result.city = parts[2];
    } else {
      // Check if the third part contains a state and postal code
      const stateZipMatch = parts[2].match(/([A-Z]{2})\s+(\d{5}(-\d{4})?)/);
      if (stateZipMatch) {
        result.state = stateZipMatch[1];
        result.postalCode = stateZipMatch[2];
      } else {
        result.state = parts[2];
      }
    }
  }
  
  if (parts.length >= 4) {
    // If we have a fourth part and haven't set the state yet
    if (result.state === 'Unknown') {
      const stateZipMatch = parts[3].match(/([A-Z]{2})\s+(\d{5}(-\d{4})?)/);
      if (stateZipMatch) {
        result.state = stateZipMatch[1];
        result.postalCode = stateZipMatch[2];
      } else {
        result.state = parts[3];
      }
    }
  }
  
  if (parts.length >= 5) {
    result.country = parts[parts.length - 1];
  }
  
  return result;
}

/**
 * Helper function to transform opening hours
 */
function transformOpeningHours(openingHours: GoogleMapsPlaceResult['opening_hours']): Business['hours'] {
  if (!openingHours) return undefined;
  
  // Map day numbers to day names
  const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  // Initialize hours object
  const hours: Record<string, any> = {
    is_open_now: openingHours.open_now
  };
  
  // Parse periods if available
  if (openingHours.periods) {
    openingHours.periods.forEach(period => {
      const day = dayMap[period.open.day];
      const openTime = formatTime(period.open.time);
      const closeTime = period.close ? formatTime(period.close.time) : undefined;
      
      hours[day] = {
        open: openTime,
        close: closeTime,
        is_closed: false
      };
    });
  }
  
  return hours as Business['hours'];
}

/**
 * Helper function to format a time string from "HHMM" to "HH:MM"
 */
function formatTime(time: string): string {
  if (time.length !== 4) return time;
  return `${time.substring(0, 2)}:${time.substring(2, 4)}`;
}

/**
 * Helper function to format a category from snake_case to Title Case
 */
export function formatCategory(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
