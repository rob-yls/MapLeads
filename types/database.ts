/**
 * Database Types for MapLeads
 * 
 * This file contains TypeScript interfaces that match the structure of our Supabase database tables.
 * These interfaces are used for type safety and development experience.
 */

/**
 * User type from Supabase Auth
 * This is automatically created by Supabase Auth
 */
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

/**
 * Search history record
 * Tracks user search history and parameters
 */
export interface Search {
  id: string;
  user_id: string;
  query: string;
  location: string;
  radius: number;
  category?: string;
  created_at: string;
  filters?: Record<string, any>;
  result_count: number;
}

/**
 * Business information
 * Stores detailed business information from Google Maps API
 */
export interface Business {
  id: string;
  google_place_id: string;
  name: string;
  formatted_address: string; // Complete address as returned by Google
  address: string;
  address2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude: number;
  longitude: number;
  category?: string;
  categories?: string[];
  description?: string;
  rating?: number;
  review_count?: number;
  price_level?: number;
  hours?: BusinessHours;
  photos?: string[];
  created_at: string;
  updated_at: string;
  last_fetched: string;
  googleMapUrl?: string;
}

/**
 * Business hours
 * Represents the operating hours of a business
 */
export interface BusinessHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
  is_open_now?: boolean;
}

/**
 * Day hours
 * Represents the opening and closing hours for a specific day
 */
export interface DayHours {
  open?: string;
  close?: string;
  is_closed?: boolean;
}

/**
 * Search result
 * Junction table linking searches to businesses
 */
export interface SearchResult {
  id: string;
  search_id: string;
  business_id: string;
  rank: number;
  created_at: string;
}

/**
 * Lead status type
 * Possible statuses for a lead
 */
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

/**
 * Lead priority type
 * Possible priority levels for a lead (1-5)
 */
export type LeadPriority = 1 | 2 | 3 | 4 | 5;

/**
 * Lead
 * Tracks businesses marked as leads by users
 */
export interface Lead {
  id: string;
  user_id: string;
  business_id: string;
  status: LeadStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  follow_up_date?: string;
  priority: LeadPriority;
  tags?: string[];
}

/**
 * Database schema
 * Represents the entire database schema
 */
export interface Database {
  users: User[];
  searches: Search[];
  businesses: Business[];
  search_results: SearchResult[];
  leads: Lead[];
}
