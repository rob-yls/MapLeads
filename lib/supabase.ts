import { createClient } from '@supabase/supabase-js';

// These environment variables will be set in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if the environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Authentication and database features will not work properly.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for Supabase tables
export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type Search = {
  id: string;
  user_id: string;
  business_type: string;
  location: string;
  timestamp: string;
};

export type Result = {
  id: string;
  search_id: string;
  business_name: string;
  address: {
    street: string;
    city: string;
  };
  rating: number;
  contact_info: {
    phone: string | null;
    email: string | null;
    website: string | null;
  };
  description: string;
};
