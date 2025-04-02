/**
 * Google Maps Place Details API Route
 * 
 * This API route handles fetching detailed information about a business
 * using the Google Maps API and the place_id.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { googleMapsService } from '@/lib/google-maps';
import { businessService } from '@/lib/database';

// DEVELOPMENT ONLY: Set this to true to bypass authentication checks
const BYPASS_AUTH_FOR_DEVELOPMENT = true;

// Valid UUID format for development testing
const DEV_TEST_USER_ID = '00000000-0000-0000-0000-000000000000';

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
    const placeId = searchParams.get('placeId');
    
    // Validate required fields
    if (!placeId) {
      return NextResponse.json(
        { error: 'Place ID is required' },
        { status: 400 }
      );
    }
    
    // First, check if we already have this business in our database
    const existingBusiness = await businessService.getBusinessByPlaceId(placeId);
    
    if (existingBusiness) {
      // If the business exists and was fetched recently (within 7 days), return it
      const lastFetched = new Date(existingBusiness.last_fetched);
      const now = new Date();
      const daysSinceLastFetch = (now.getTime() - lastFetched.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastFetch < 7) {
        return NextResponse.json({ business: existingBusiness });
      }
    }
    
    // Fetch the business details from Google Maps API
    const businessDetails = await googleMapsService.getBusinessDetails(placeId);
    
    // Diagnostic logging to verify the phone and website data is present
    console.log('API Details response for:', businessDetails.name);
    console.log('Phone:', businessDetails.phone);
    console.log('Website:', businessDetails.website);
    
    // Save or update the business in our database
    const savedBusiness = await businessService.upsertBusiness(businessDetails as any);
    
    // Return the business details
    return NextResponse.json({ business: savedBusiness });
  } catch (error: any) {
    console.error('Error in maps details API:', error);
    
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
