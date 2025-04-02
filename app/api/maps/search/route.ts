/**
 * Google Maps Search API Route
 * 
 * This API route handles searching for businesses using the Google Maps API.
 * It validates the request, performs the search, and returns the results.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { googleMapsService } from '@/lib/google-maps';
import { searchService, businessService, searchResultService } from '@/lib/database';

// DEVELOPMENT ONLY: Set this to true to bypass authentication checks
const BYPASS_AUTH_FOR_DEVELOPMENT = true;

// Valid UUID format for development testing
const DEV_TEST_USER_ID = '00000000-0000-0000-0000-000000000000';

export async function POST(request: NextRequest) {
  try {
    // Get the current user from Supabase Auth
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    // DEVELOPMENT ONLY: Skip authentication check if bypass is enabled
    const isDevelopment = process.env.NODE_ENV !== 'production';
    if (!session && !(isDevelopment && BYPASS_AUTH_FOR_DEVELOPMENT)) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // For development mode with bypass, use a valid UUID format mock user ID if no session
    const userId = session?.user?.id || (isDevelopment && BYPASS_AUTH_FOR_DEVELOPMENT ? DEV_TEST_USER_ID : null);
    
    // Parse the request body
    const body = await request.json();
    const { query, location, radius = 5000, category } = body;
    
    // Validate required fields
    if (!query || !location) {
      return NextResponse.json(
        { error: 'Query and location are required' },
        { status: 400 }
      );
    }
    
    // Perform the search using Google Maps API
    console.log(`[API] Searching for businesses with query=${query}, location=${location}, radius=${radius}`);
    
    const searchResults = await googleMapsService.searchBusinesses(
      query,
      location,
      radius,
      category
    );
    
    // Manually fetch details for each place to ensure we have complete contact information
    if (searchResults.results.length > 0) {
      const enhancedResults = await Promise.all(
        searchResults.results.slice(0, 10).map(async (business) => {
          try {
            // Get full details for each business to ensure phone and website data is present
            const details = await googleMapsService.getBusinessDetails(business.google_place_id || business.id || '');
            return details;
          } catch (error) {
            console.error(`[API] Failed to get details for ${business.name}:`, error);
            return business;
          }
        })
      );
      
      // Replace the first 10 results with enhanced results
      searchResults.results.splice(0, enhancedResults.length, ...enhancedResults);
    }
    
    // In development mode with bypass, we can optionally skip database operations
    const skipDatabaseOps = isDevelopment && BYPASS_AUTH_FOR_DEVELOPMENT && !session;
    
    // Save the search to the database (only if we have a valid user ID and not skipping DB ops)
    if (userId && !skipDatabaseOps) {
      try {
        const search = await searchService.createSearch({
          user_id: userId,
          query,
          location,
          radius,
          category: category || null,
          filters: body.filters || {}
        });
        
        // Save each business and create search results
        const savedBusinesses = [];
        for (const business of searchResults.results) {
          const savedBusiness = await businessService.upsertBusiness(business as any);
          savedBusinesses.push(savedBusiness);
        }
        
        // Create search results linking the search to the businesses
        await searchResultService.createSearchResults(search.id, savedBusinesses);
        
        // Update the result count
        await searchService.updateResultCount(search.id, savedBusinesses.length);
      } catch (dbError) {
        // Log database errors but don't fail the request
        console.error('Database operation failed:', dbError);
        // In development mode, we can continue without database operations
        if (!isDevelopment) {
          throw dbError; // In production, we should propagate the error
        }
      }
    } else if (skipDatabaseOps) {
      console.log('Development mode: Skipping database operations');
    }
    
    // Return the search results
    return NextResponse.json({
      results: searchResults.results,
      nextPageToken: searchResults.nextPageToken
    });
  } catch (error: any) {
    console.error('Error in maps search API:', error);
    
    // Handle Google Maps API specific errors
    if (error.name === 'GoogleMapsError') {
      return NextResponse.json(
        { error: error.message, status: error.status },
        { status: 500 }
      );
    }
    
    // Handle general errors
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the current user from Supabase Auth
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    // DEVELOPMENT ONLY: Skip authentication check if bypass is enabled
    const isDevelopment = process.env.NODE_ENV !== 'production';
    if (!session && !(isDevelopment && BYPASS_AUTH_FOR_DEVELOPMENT)) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // For development mode with bypass, use a valid UUID format mock user ID if no session
    const userId = session?.user?.id || (isDevelopment && BYPASS_AUTH_FOR_DEVELOPMENT ? DEV_TEST_USER_ID : null);
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const location = searchParams.get('location');
    const radiusParam = searchParams.get('radius');
    const category = searchParams.get('category');
    const pageToken = searchParams.get('pageToken');
    
    // Validate required fields
    if (!query || !location) {
      return NextResponse.json(
        { error: 'Query and location are required' },
        { status: 400 }
      );
    }
    
    const radius = radiusParam ? parseInt(radiusParam, 10) : 5000;
    
    // Perform the search using Google Maps API
    console.log(`[API] Searching for businesses with query=${query}, location=${location}, radius=${radius}`);
    
    const searchResults = await googleMapsService.searchBusinesses(
      query,
      location,
      radius,
      category || undefined,
      pageToken || undefined
    );
    
    // Manually fetch details for each place to ensure we have complete contact information
    if (searchResults.results.length > 0) {
      const enhancedResults = await Promise.all(
        searchResults.results.slice(0, 10).map(async (business) => {
          try {
            // Get full details for each business to ensure phone and website data is present
            const details = await googleMapsService.getBusinessDetails(business.google_place_id || business.id || '');
            return details;
          } catch (error) {
            console.error(`[API] Failed to get details for ${business.name}:`, error);
            return business;
          }
        })
      );
      
      // Replace the first 10 results with enhanced results
      searchResults.results.splice(0, enhancedResults.length, ...enhancedResults);
    }
    
    // Return the search results
    return NextResponse.json({
      results: searchResults.results,
      nextPageToken: searchResults.nextPageToken
    });
  } catch (error: any) {
    console.error('Error in maps search API:', error);
    
    // Handle Google Maps API specific errors
    if (error.name === 'GoogleMapsError') {
      return NextResponse.json(
        { error: error.message, status: error.status },
        { status: 500 }
      );
    }
    
    // Handle general errors
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
