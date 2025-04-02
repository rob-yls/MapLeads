/**
 * Database Helper Functions for MapLeads
 * 
 * This file contains helper functions for interacting with the Supabase database.
 * It uses the TypeScript interfaces defined in types/database.ts.
 */

import { supabase } from './supabase';
import type { 
  Search, 
  Business, 
  SearchResult, 
  Lead, 
  LeadStatus, 
  LeadPriority 
} from '../types/database';

/**
 * Search related functions
 */
export const searchService = {
  /**
   * Create a new search record
   */
  createSearch: async (search: Omit<Search, 'id' | 'created_at' | 'result_count'>) => {
    const { data, error } = await supabase
      .from('searches')
      .insert({
        ...search,
        result_count: 0, // Initialize with 0 results
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as Search;
  },

  /**
   * Get all searches for a user
   */
  getUserSearches: async (userId: string) => {
    const { data, error } = await supabase
      .from('searches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Search[];
  },

  /**
   * Get a specific search by ID
   */
  getSearchById: async (searchId: string) => {
    const { data, error } = await supabase
      .from('searches')
      .select('*')
      .eq('id', searchId)
      .single();
    
    if (error) throw error;
    return data as Search;
  },

  /**
   * Update the result count for a search
   */
  updateResultCount: async (searchId: string, resultCount: number) => {
    const { data, error } = await supabase
      .from('searches')
      .update({ result_count: resultCount })
      .eq('id', searchId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Search;
  },

  /**
   * Delete a search
   */
  deleteSearch: async (searchId: string) => {
    const { error } = await supabase
      .from('searches')
      .delete()
      .eq('id', searchId);
    
    if (error) throw error;
    return true;
  }
};

/**
 * Business related functions
 */
export const businessService = {
  /**
   * Create a new business record or update if it already exists
   */
  upsertBusiness: async (business: Omit<Business, 'id' | 'created_at' | 'updated_at' | 'last_fetched'>) => {
    // Check if business already exists by google_place_id
    const { data: existingBusiness } = await supabase
      .from('businesses')
      .select('id')
      .eq('google_place_id', business.google_place_id)
      .single();
    
    if (existingBusiness) {
      // Update existing business
      const { data, error } = await supabase
        .from('businesses')
        .update({
          ...business,
          updated_at: new Date().toISOString(),
          last_fetched: new Date().toISOString()
        })
        .eq('id', existingBusiness.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Business;
    } else {
      // Create new business
      const { data, error } = await supabase
        .from('businesses')
        .insert({
          ...business,
          updated_at: new Date().toISOString(),
          last_fetched: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Business;
    }
  },

  /**
   * Get a business by ID
   */
  getBusinessById: async (businessId: string) => {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();
    
    if (error) throw error;
    return data as Business;
  },

  /**
   * Get a business by Google Place ID
   */
  getBusinessByPlaceId: async (placeId: string) => {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('google_place_id', placeId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows returned" error
    return data as Business | null;
  },

  /**
   * Get businesses by IDs
   */
  getBusinessesByIds: async (businessIds: string[]) => {
    if (businessIds.length === 0) return [];
    
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .in('id', businessIds);
    
    if (error) throw error;
    return data as Business[];
  }
};

/**
 * Search Results related functions
 */
export const searchResultService = {
  /**
   * Create search result records for a search
   */
  createSearchResults: async (searchId: string, businesses: Business[]) => {
    if (businesses.length === 0) return [];
    
    const searchResults = businesses.map((business, index) => ({
      search_id: searchId,
      business_id: business.id,
      rank: index + 1
    }));
    
    const { data, error } = await supabase
      .from('search_results')
      .insert(searchResults)
      .select();
    
    if (error) throw error;
    return data as SearchResult[];
  },

  /**
   * Get all results for a search
   */
  getSearchResults: async (searchId: string) => {
    const { data, error } = await supabase
      .from('search_results')
      .select(`
        *,
        business:business_id (*)
      `)
      .eq('search_id', searchId)
      .order('rank');
    
    if (error) throw error;
    return data;
  }
};

/**
 * Lead related functions
 */
export const leadService = {
  /**
   * Create a new lead
   */
  createLead: async (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('leads')
      .insert({
        ...lead,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as Lead;
  },

  /**
   * Get all leads for a user
   */
  getUserLeads: async (userId: string) => {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        business:business_id (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  /**
   * Get a lead by ID
   */
  getLeadById: async (leadId: string) => {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        business:business_id (*)
      `)
      .eq('id', leadId)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update a lead
   */
  updateLead: async (leadId: string, updates: Partial<Omit<Lead, 'id' | 'created_at' | 'updated_at'>>) => {
    const { data, error } = await supabase
      .from('leads')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Lead;
  },

  /**
   * Update lead status
   */
  updateLeadStatus: async (leadId: string, status: LeadStatus) => {
    return leadService.updateLead(leadId, { status });
  },

  /**
   * Update lead priority
   */
  updateLeadPriority: async (leadId: string, priority: LeadPriority) => {
    return leadService.updateLead(leadId, { priority });
  },

  /**
   * Delete a lead
   */
  deleteLead: async (leadId: string) => {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId);
    
    if (error) throw error;
    return true;
  }
};

/**
 * Combined service for performing operations that span multiple tables
 */
export const mapLeadsService = {
  /**
   * Perform a search and save all related data
   * This creates a search record, saves the businesses, and creates search results
   */
  saveSearchResults: async (
    userId: string, 
    searchParams: Omit<Search, 'id' | 'created_at' | 'user_id' | 'result_count'>, 
    businesses: Omit<Business, 'id' | 'created_at' | 'updated_at' | 'last_fetched'>[]
  ) => {
    // Create the search record
    const search = await searchService.createSearch({
      ...searchParams,
      user_id: userId
    });

    // Save all businesses
    const savedBusinesses = await Promise.all(
      businesses.map(business => businessService.upsertBusiness(business))
    );

    // Create search results
    await searchResultService.createSearchResults(search.id, savedBusinesses);

    // Update the result count
    await searchService.updateResultCount(search.id, savedBusinesses.length);

    return {
      search,
      businesses: savedBusinesses
    };
  },

  /**
   * Get a complete search with all results
   */
  getCompleteSearch: async (searchId: string) => {
    const search = await searchService.getSearchById(searchId);
    const results = await searchResultService.getSearchResults(searchId);
    
    return {
      search,
      results
    };
  },

  /**
   * Convert a search result to a lead
   */
  convertResultToLead: async (userId: string, businessId: string, initialStatus: LeadStatus = 'new') => {
    return leadService.createLead({
      user_id: userId,
      business_id: businessId,
      status: initialStatus,
      priority: 3 // Default medium priority
    });
  }
};
