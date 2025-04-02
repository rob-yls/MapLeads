"use client"

/**
 * Maps API Hook
 * 
 * This hook provides a clean interface for interacting with the Google Maps API
 * through our backend API routes.
 */

import { useState } from 'react';
import type { Business, Search } from '@/types/database';

interface SearchOptions {
  query: string;
  location: string;
  radius?: number;
  category?: string;
  filters?: Record<string, any>;
}

interface SearchResponse {
  search: Search;
  results: Partial<Business>[];
  nextPageToken?: string;
}

interface UseMapApiReturn {
  isSearching: boolean;
  searchError: string | null;
  searchResults: Partial<Business>[] | null;
  search: Search | null;
  nextPageToken: string | null;
  searchBusinesses: (options: SearchOptions) => Promise<void>;
  loadMoreResults: () => Promise<void>;
  
  isLoadingDetails: boolean;
  detailsError: string | null;
  businessDetails: Business | null;
  getBusinessDetails: (placeId: string) => Promise<void>;
}

export function useMapApi(): UseMapApiReturn {
  // Search state
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Partial<Business>[] | null>(null);
  const [search, setSearch] = useState<Search | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [lastSearchOptions, setLastSearchOptions] = useState<SearchOptions | null>(null);
  
  // Details state
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [businessDetails, setBusinessDetails] = useState<Business | null>(null);

  /**
   * Search for businesses using the Google Maps API
   */
  const searchBusinesses = async (options: SearchOptions) => {
    try {
      setIsSearching(true);
      setSearchError(null);
      setSearchResults(null);
      setSearch(null);
      setNextPageToken(null);
      setLastSearchOptions(options);
      
      const response = await fetch('/api/maps/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to search businesses');
      }
      
      const data = await response.json() as SearchResponse;
      
      setSearchResults(data.results);
      setSearch(data.search);
      setNextPageToken(data.nextPageToken || null);
    } catch (error: any) {
      setSearchError(error.message || 'An error occurred while searching');
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Load more search results using the next page token
   */
  const loadMoreResults = async () => {
    if (!nextPageToken || !lastSearchOptions) return;
    
    try {
      setIsSearching(true);
      
      const queryParams = new URLSearchParams({
        query: lastSearchOptions.query,
        location: lastSearchOptions.location,
        radius: (lastSearchOptions.radius || 5000).toString(),
        pageToken: nextPageToken,
      });
      
      if (lastSearchOptions.category) {
        queryParams.append('category', lastSearchOptions.category);
      }
      
      const response = await fetch(`/api/maps/search?${queryParams.toString()}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to load more results');
      }
      
      const data = await response.json();
      
      // Append new results to existing results
      setSearchResults(prev => prev ? [...prev, ...data.results] : data.results);
      setNextPageToken(data.nextPageToken || null);
    } catch (error: any) {
      setSearchError(error.message || 'An error occurred while loading more results');
      console.error('Load more error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Get detailed information about a business
   */
  const getBusinessDetails = async (placeId: string) => {
    try {
      setIsLoadingDetails(true);
      setDetailsError(null);
      setBusinessDetails(null);
      
      const response = await fetch(`/api/maps/details?placeId=${encodeURIComponent(placeId)}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get business details');
      }
      
      const data = await response.json();
      setBusinessDetails(data.business);
    } catch (error: any) {
      setDetailsError(error.message || 'An error occurred while fetching business details');
      console.error('Details error:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return {
    isSearching,
    searchError,
    searchResults,
    search,
    nextPageToken,
    searchBusinesses,
    loadMoreResults,
    
    isLoadingDetails,
    detailsError,
    businessDetails,
    getBusinessDetails,
  };
}
