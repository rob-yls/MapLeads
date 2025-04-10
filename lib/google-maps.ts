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

export interface GoogleMapsTextSearchResponse {
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
/**
 * Calculate grid points around a central location
 * @param centerLat - The latitude of the center point
 * @param centerLng - The longitude of the center point
 * @param radiusInMeters - The radius in meters for the search area
 * @param gridSize - The number of points to generate in each direction (total points = (2*gridSize+1)^2)
 * @returns An array of {lat, lng} objects representing grid points
 */
export function calculateGridPoints(
  centerLat: number,
  centerLng: number,
  radiusInMeters: number,
  gridSize: number = 2
): Array<{lat: number, lng: number}> {
  // Earth's radius in meters
  const EARTH_RADIUS = 6378137;
  
  // Calculate the angular distance in radians
  const angularDistance = radiusInMeters / EARTH_RADIUS;
  
  // Calculate the latitude offset for the grid
  const latOffset = angularDistance * (180 / Math.PI);
  
  // Calculate the longitude offset for the grid
  // This varies based on latitude due to the Earth's curvature
  const lngOffset = angularDistance * (180 / Math.PI) / Math.cos(centerLat * Math.PI / 180);
  
  // For very large radii, we need to adjust our grid distribution strategy
  // Base radius (50 miles = 80467 meters) is our reference point
  const BASE_RADIUS = 80467;
  
  // For larger radii, we'll use a different distribution strategy
  let gridPoints: Array<{lat: number, lng: number}> = [];
  
  if (radiusInMeters > BASE_RADIUS * 2) {
    // For very large radii, create a multi-tier grid with concentrated points
    // near the center and more dispersed points at the edges
    
    // Add the center point
    gridPoints.push({ lat: centerLat, lng: centerLng });
    
    // Create concentric rings of points with increasing distance
    for (let ring = 1; ring <= gridSize; ring++) {
      // Scale factor increases with each ring
      const ringScale = ring / gridSize;
      
      // Number of points in this ring (more points in outer rings)
      const pointsInRing = Math.max(8, Math.floor(8 * ringScale * 2));
      
      // Create points in a circle for this ring
      for (let i = 0; i < pointsInRing; i++) {
        const angle = (i / pointsInRing) * 2 * Math.PI;
        const distance = ringScale * radiusInMeters * 0.8; // 80% of max radius
        
        // Convert polar coordinates to lat/lng
        const lat = centerLat + (distance / EARTH_RADIUS) * (180 / Math.PI) * Math.cos(angle);
        const lng = centerLng + (distance / EARTH_RADIUS) * (180 / Math.PI) / Math.cos(centerLat * Math.PI / 180) * Math.sin(angle);
        
        gridPoints.push({ lat, lng });
      }
    }
    
    // For large radii, also add some random points within the search area
    // to improve coverage of areas that might be missed
    const randomPoints = gridSize * 3;
    for (let i = 0; i < randomPoints; i++) {
      // Random distance between 30% and 90% of the radius
      const randomDistance = (0.3 + Math.random() * 0.6) * radiusInMeters;
      const randomAngle = Math.random() * 2 * Math.PI;
      
      const lat = centerLat + (randomDistance / EARTH_RADIUS) * (180 / Math.PI) * Math.cos(randomAngle);
      const lng = centerLng + (randomDistance / EARTH_RADIUS) * (180 / Math.PI) / Math.cos(centerLat * Math.PI / 180) * Math.sin(randomAngle);
      
      gridPoints.push({ lat, lng });
    }
  } else {
    // For smaller radii, use the original grid pattern
    // Calculate the step size for the grid
    const latStep = latOffset / gridSize;
    const lngStep = lngOffset / gridSize;
    
    // Generate grid points
    for (let i = -gridSize; i <= gridSize; i++) {
      for (let j = -gridSize; j <= gridSize; j++) {
        // Skip the center point if it's already included
        if (i === 0 && j === 0 && gridPoints.some(p => p.lat === centerLat && p.lng === centerLng)) {
          continue;
        }
        
        const lat = centerLat + i * latStep;
        const lng = centerLng + j * lngStep;
        
        gridPoints.push({ lat, lng });
      }
    }
  }
  
  console.log(`[Grid Search] Generated ${gridPoints.length} grid points for radius ${radiusInMeters}m`);
  return gridPoints;
}

/**
 * Geocode a location string to get coordinates
 * @param locationString - The location string (e.g., "Austin, TX")
 * @returns A promise that resolves to {lat, lng} coordinates
 */
async function geocodeLocation(locationString: string): Promise<{lat: number, lng: number}> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('Google Maps API key is not configured');
  }
  
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationString)}&key=${apiKey}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geocoding request failed: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (data.status !== 'OK') {
    throw new GoogleMapsError(`Geocoding error: ${data.status}${data.error_message ? ` - ${data.error_message}` : ''}`, data.status);
  }
  
  if (!data.results || data.results.length === 0) {
    throw new Error('No geocoding results found');
  }
  
  const locationCoords = data.results[0].geometry.location;
  return { lat: locationCoords.lat, lng: locationCoords.lng };
}

/**
 * Parse a search query to extract business type and location
 * @param query - The search query (e.g., "coffee shops in miami")
 * @returns An object with businessType and location
 */
export function parseSearchQuery(query: string): { businessType: string, location: string } {
  // Check if the query already contains location information
  const inMatch = query.match(/(.+?)\s+in\s+(.+)/i);
  const nearMatch = query.match(/(.+?)\s+near\s+(.+)/i);
  
  if (inMatch) {
    return { businessType: inMatch[1].trim(), location: inMatch[2].trim() };
  } else if (nearMatch) {
    return { businessType: nearMatch[1].trim(), location: nearMatch[2].trim() };
  }
  
  // Default case - assume the entire input is the business type
  return { businessType: query, location: '' };
}

export const googleMapsService = {
  /**
   * Intelligent search that chooses the best search strategy based on the query
   */
  intelligentSearch: async (
    query: string,
    location: string,
    radius: number = 5000,
    type?: string,
    useGridSearch: boolean = false,
    gridSize: number = 2
  ): Promise<{ results: Partial<Business>[], nextPageToken?: string }> => {
    console.log(`[Intelligent Search] Query: "${query}", Location: "${location}", Radius: ${radius}m`);
    
    // If grid search is explicitly requested, use it
    if (useGridSearch) {
      console.log('[Intelligent Search] Using grid search as requested');
      return googleMapsService.gridSearchBusinesses(query, location, radius, type, gridSize);
    }
    
    try {
      // First try to geocode the location to see if it's a valid place
      const coordinates = await geocodeLocation(location);
      console.log(`[Intelligent Search] Successfully geocoded location to:`, coordinates);
      
      // Use Nearby Search for more accurate location-based results
      console.log('[Intelligent Search] Using Nearby Search API');
      return googleMapsService.nearbySearchBusinesses(query, coordinates, radius, type);
    } catch (error) {
      // If geocoding fails or for any other reason, fall back to text search
      console.log('[Intelligent Search] Geocoding failed or error occurred, falling back to text search');
      return googleMapsService.searchBusinesses(query, location, radius, type);
    }
  },
  
  /**
   * Search for businesses using the Google Maps Places Nearby Search API
   * This provides more accurate location-based results than text search
   */
  nearbySearchBusinesses: async (
    keyword: string,
    coordinates: { lat: number, lng: number },
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
    console.log(`[Nearby Search] Making Google Maps API request with key: ${maskedKey}`);
    
    // Construct the API URL for Nearby Search
    const baseUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
    const url = new URL(baseUrl);
    
    // Add required parameters
    url.searchParams.append('location', `${coordinates.lat},${coordinates.lng}`);
    url.searchParams.append('radius', radius.toString());
    url.searchParams.append('key', apiKey);
    
    // Add optional parameters
    if (keyword) url.searchParams.append('keyword', keyword);
    if (type) url.searchParams.append('type', type);
    if (pageToken) url.searchParams.append('pagetoken', pageToken);
    
    console.log(`[Nearby Search] URL params: keyword=${keyword}, location=${coordinates.lat},${coordinates.lng}, radius=${radius}`);
    
    try {
      // Make the API request with cache disabled
      const response = await fetch(url.toString(), {
        cache: 'no-store',
        next: { revalidate: 0 } // Disable caching
      });
      
      if (!response.ok) {
        console.error(`[Nearby Search] API request failed with status: ${response.status} ${response.statusText}`);
        throw new Error(`Google Maps API request failed: ${response.statusText}`);
      }
      
      const data: GoogleMapsSearchResponse = await response.json();
      
      // Log the raw API response for debugging
      console.log(`[Nearby Search] API returned ${data.results.length} results`);
      
      // Handle API errors
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error(`[Nearby Search] API returned error status: ${data.status}`, data.error_message || 'No error message provided');
        throw new GoogleMapsError(`Google Maps API error: ${data.status}${data.error_message ? ` - ${data.error_message}` : ''}`, data.status);
      }
      
      // Process results to get business details
      const detailedResults: Partial<Business>[] = [];
      
      if (data.results.length > 0) {
        // Process a limited number of results to avoid rate limiting
        const MAX_DETAILS = 10;
        const resultsToProcess = Math.min(data.results.length, MAX_DETAILS);
        
        console.log(`[Nearby Search] Fetching details for ${resultsToProcess} places`);
        
        for (let i = 0; i < resultsToProcess; i++) {
          const place = data.results[i];
          try {
            // Fetch detailed place info for phone and website
            const details = await googleMapsService.getBusinessDetails(place.place_id);
            detailedResults.push(details);
          } catch (error) {
            console.error(`[Nearby Search] Error fetching details for place ${place.place_id}:`, error);
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
      console.error('[Nearby Search] Error:', error);
      throw error;
    }
  },
  
  /**
   * Search for businesses using the Google Maps Places Text Search API
   * This is the original search method, kept for backward compatibility
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
   * Get the next page of results using a page token
   */
  getNextPageResults: async (pageToken: string): Promise<{ results: Partial<Business>[]; nextPageToken?: string }> => {
    if (!pageToken) {
      throw new Error('Page token is required');
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key is not configured');
    }

    try {
      // Construct the URL with the page token
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${pageToken}&key=${apiKey}`;
      
      console.log(`Fetching next page results with token: ${pageToken}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`Google Maps API request failed with status: ${response.status} ${response.statusText}`);
        throw new Error(`Google Maps API request failed: ${response.statusText}`);
      }
      
      const data = await response.json() as GoogleMapsTextSearchResponse;
      
      // Handle API errors
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error(`Google Maps API returned error status: ${data.status}`, data.error_message || 'No error message provided');
        throw new GoogleMapsError(`Google Maps API error: ${data.status}${data.error_message ? ` - ${data.error_message}` : ''}`, data.status);
      }
      
      // Transform the results to our Business type
      const businesses = data.results.map(place => transformPlaceToBusinessPartial(place));
      
      return {
        results: businesses,
        nextPageToken: data.next_page_token
      };
    } catch (error) {
      console.error('Error fetching next page of results:', error);
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
  /**
   * Grid-based search for businesses to overcome the 60-result limit
   * This function splits the search area into a grid of smaller, overlapping searches
   * @param query - The search query (e.g., "restaurants")
   * @param location - The location string (e.g., "Austin, TX")
   * @param radius - The radius in meters for each sub-search (default: 5000)
   * @param type - Optional business type to filter by
   * @param gridSize - The size of the grid (default: 2, which creates a 5x5 grid)
   * @returns A promise that resolves to combined search results with duplicates removed
   */
  gridSearchBusinesses: async (
    query: string,
    location: string,
    radius: number = 5000,
    type?: string,
    gridSize: number = 2
  ): Promise<{ results: Partial<Business>[], nextPageToken?: string }> => {
    console.log(`[Grid Search] Starting grid search for ${query} in ${location} with radius ${radius}m and grid size ${gridSize}`);
    
    try {
      // Step 1: Geocode the location to get coordinates
      const centerCoords = await geocodeLocation(location);
      console.log(`[Grid Search] Geocoded ${location} to coordinates:`, centerCoords);
      
      // Step 2: Calculate grid points
      const gridPoints = calculateGridPoints(centerCoords.lat, centerCoords.lng, radius, gridSize);
      console.log(`[Grid Search] Generated ${gridPoints.length} grid points`);
      
      // Step 3: Determine if we should split the search by categories
      // This is especially useful for real estate searches with large radii
      let categoriesToSearch: string[] = [];
      const isRealEstateSearch = query.toLowerCase().includes('real estate') || 
                              query.toLowerCase().includes('realtor') ||
                              query.toLowerCase().includes('property');
    
      const isLargeRadius = radius > 80467; // 50 miles
    
      if (isRealEstateSearch && isLargeRadius) {
        console.log(`[Grid Search] Using category splitting for real estate search with large radius`);
        categoriesToSearch = [
          "real estate agents",
          "real estate brokers",
          "realtors",
          "property management",
          "real estate offices"
        ];
      } else {
        // For non-real estate searches or smaller radii, just use the original query
        categoriesToSearch = [query];
      }
    
      // Step 4: Perform searches for each grid point and each category
      // Use a smaller radius for each sub-search to avoid too much overlap
      const subSearchRadius = radius / (gridSize + 1);
      console.log(`[Grid Search] Using sub-search radius of ${subSearchRadius}m`);
    
      const allResults: Partial<Business>[] = [];
      const processedPlaceIds = new Set<string>();
    
      // Track progress for logging
      let completedSearches = 0;
      const totalSearches = gridPoints.length * categoriesToSearch.length;
    
      for (const searchQuery of categoriesToSearch) {
        for (const point of gridPoints) {
          try {
            // Convert coordinates to a location string for the search
            const pointLocation = `${point.lat},${point.lng}`;
    
            // Perform the search for this grid point and category
            // Use nearby search for more accurate location-based results
            let searchResult;
            try {
              console.log(`[Grid Search] Using nearby search at coordinates ${pointLocation}`);
              searchResult = await googleMapsService.nearbySearchBusinesses(
                searchQuery,
                { lat: point.lat, lng: point.lng },
                subSearchRadius,
                type
              );
            } catch (error) {
              // Fall back to text search if nearby search fails
              console.log(`[Grid Search] Nearby search failed, falling back to text search: ${error}`);
              searchResult = await googleMapsService.searchBusinesses(
                searchQuery,
                pointLocation,
                subSearchRadius,
                type
              );
            }
    
            // Process results and remove duplicates
            if (!searchResult || !searchResult.results) {
              console.log(`[Grid Search] No results found for point ${pointLocation}`);
              continue;
            }
            
            for (const business of searchResult.results) {
              // Skip if we've already processed this place
              if (business.google_place_id && processedPlaceIds.has(business.google_place_id)) {
                continue;
              }
    
              // Add to results and mark as processed
              if (business.google_place_id) {
                processedPlaceIds.add(business.google_place_id);
                allResults.push(business);
              }
            }
    
            // Update progress
            completedSearches++;
            console.log(`[Grid Search] Completed ${completedSearches}/${totalSearches} searches. Found ${allResults.length} unique businesses so far.`);
    
            // If we have a next page token, process it
            let nextPageToken = searchResult.nextPageToken;
            while (nextPageToken) {
              // Wait a short delay before using the page token (required by Google's API)
              await new Promise(resolve => setTimeout(resolve, 2000));
    
              const nextPageResult = await googleMapsService.getNextPageResults(nextPageToken);
    
              // Process next page results
              for (const business of nextPageResult.results) {
                if (business.google_place_id && !processedPlaceIds.has(business.google_place_id)) {
                  processedPlaceIds.add(business.google_place_id);
                  allResults.push(business);
                }
              }
    
              // Update for next iteration
              nextPageToken = nextPageResult.nextPageToken;
            }
          } catch (error) {
            // Log error but continue with other grid points
            console.error(`[Grid Search] Error searching at point ${point.lat},${point.lng}:`, error);
          }
        }
      }
    
      console.log(`[Grid Search] Completed all searches. Found ${allResults.length} unique businesses.`);
    
      return {
        results: allResults,
        // No next page token for grid search as we've already fetched all pages
        nextPageToken: undefined
      };
    } catch (error) {
      console.error('[Grid Search] Error performing grid search:', error);
      throw error;
    }
  },
  
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
  } else if (place.vicinity) {
    // If we don't have formatted_address but have vicinity, use that
    street = place.vicinity;
  }
  
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
    formatted_address: place.formatted_address || place.vicinity || '',
    address: street || '',
    address2: address2,
    city: city || '',
    state: state || '',
    postal_code: postalCode || '',
    country: country || 'USA',
  };
  
  return baseBusiness;
}

/**
 * Transform a Google Maps place result to a full Business object
 */
export function transformPlaceToBusinessFull(place: GoogleMapsPlaceResult): Business {
  // Start with the partial business data which now includes address information
  const baseBusiness = transformPlaceToBusinessPartial(place);
  
  // Create the full business object with timestamps
  return {
    ...baseBusiness,
    // Ensure all required fields are present
    formatted_address: baseBusiness.formatted_address || place.formatted_address || place.vicinity || '',
    address: baseBusiness.address || '',
    address2: baseBusiness.address2,
    city: baseBusiness.city || '',
    state: baseBusiness.state || '',
    postal_code: baseBusiness.postal_code || '',
    country: baseBusiness.country || 'USA',
    // Add timestamps for database records
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_fetched: new Date().toISOString(),
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
