import { createClient } from '@supabase/supabase-js';

// These environment variables will be set in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Check if the environment variables are set
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables are not set. Using placeholder values for development. Authentication and database features will not work properly.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Mock Supabase auth methods for development when credentials are not available
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  // Override auth methods with mock implementations
  supabase.auth = {
    ...supabase.auth,
    getSession: async () => ({ data: { session: null }, error: null }),
    signUp: async () => ({ data: null, error: null }),
    signInWithPassword: async () => ({ data: null, error: { message: 'Development mode: Auth not available without environment variables' } }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ data: null, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  } as any;
}

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
