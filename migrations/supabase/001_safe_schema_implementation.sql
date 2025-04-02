-- MapLeads Safe Schema Implementation
-- This script safely implements the database schema for MapLeads
-- It drops all existing user tables and creates the new schema

-- SECTION 0: Transaction and Warnings
-- Wrap everything in a transaction for safety
BEGIN;

-- Output warning about data loss
DO $$
BEGIN
  RAISE NOTICE '
  ╔════════════════════════════════════════════════════════════════╗
  ║                         WARNING                                ║
  ║ This script will drop ALL existing tables and recreate the     ║
  ║ schema. ALL DATA WILL BE LOST. This is intended for            ║
  ║ development only. If you wish to preserve data, stop now       ║
  ║ and backup your data.                                          ║
  ╚════════════════════════════════════════════════════════════════╝
  ';
END $$;

-- SECTION 1: Drop all existing tables in the public schema
-- This will drop all user-created tables while preserving system tables
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Disable triggers temporarily to avoid constraint issues during drops
    SET session_replication_role = 'replica';
    
    -- Loop through all tables in the public schema and drop them
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
    
    -- Re-enable triggers
    SET session_replication_role = 'origin';
    
    RAISE NOTICE 'All tables in the public schema have been dropped.';
END $$;

-- Also drop any functions we'll be recreating
DROP FUNCTION IF EXISTS get_search_businesses(UUID);
DROP FUNCTION IF EXISTS get_user_searches(UUID);

-- SECTION 2: Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- SECTION 3: Create tables
-- Note: The 'auth.users' table is automatically created by Supabase Auth

-- Searches table
CREATE TABLE searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  location TEXT NOT NULL,
  radius INTEGER NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  filters JSONB,
  result_count INTEGER NOT NULL DEFAULT 0
);

-- Businesses table
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_place_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  website TEXT,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  category TEXT,
  categories JSONB,
  rating FLOAT,
  review_count INTEGER,
  price_level INTEGER,
  hours JSONB,
  photos JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_fetched TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Search Results table (junction table)
CREATE TABLE search_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  search_id UUID NOT NULL REFERENCES searches(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(search_id, business_id)
);

-- Leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  follow_up_date TIMESTAMPTZ,
  priority INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 5),
  tags JSONB,
  UNIQUE(user_id, business_id)
);

-- SECTION 4: Create indexes for performance
CREATE INDEX searches_user_id_idx ON searches(user_id);
CREATE INDEX businesses_google_place_id_idx ON businesses(google_place_id);
CREATE INDEX search_results_search_id_idx ON search_results(search_id);
CREATE INDEX search_results_business_id_idx ON search_results(business_id);
CREATE INDEX leads_user_id_idx ON leads(user_id);
CREATE INDEX leads_business_id_idx ON leads(business_id);
CREATE INDEX leads_status_idx ON leads(status);

-- SECTION 5: Enable Row Level Security (RLS) on all tables
ALTER TABLE searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- SECTION 6: Create RLS policies
-- Searches: Users can only see their own searches
CREATE POLICY searches_user_policy ON searches
  FOR ALL
  USING (auth.uid() = user_id);

-- Businesses: All authenticated users can read business data, but not modify it
CREATE POLICY businesses_read_policy ON businesses
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Search Results: Users can only see results linked to their searches
CREATE POLICY search_results_user_policy ON search_results
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM searches
      WHERE searches.id = search_id
      AND searches.user_id = auth.uid()
    )
  );

-- Leads: Users can only see their own leads
CREATE POLICY leads_user_policy ON leads
  FOR ALL
  USING (auth.uid() = user_id);

-- SECTION 7: Create helper functions
-- Function to get all businesses for a search
CREATE FUNCTION get_search_businesses(search_id UUID)
RETURNS TABLE (
  id UUID,
  google_place_id TEXT,
  name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  latitude FLOAT,
  longitude FLOAT,
  category TEXT,
  categories JSONB,
  rating FLOAT,
  review_count INTEGER,
  price_level INTEGER,
  hours JSONB,
  photos JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  last_fetched TIMESTAMPTZ,
  rank INTEGER
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT b.*, sr.rank
  FROM businesses b
  JOIN search_results sr ON b.id = sr.business_id
  WHERE sr.search_id = get_search_businesses.search_id
  ORDER BY sr.rank;
$$;

-- Function to get all searches for a user with result counts
CREATE FUNCTION get_user_searches(user_id UUID)
RETURNS TABLE (
  id UUID,
  query TEXT,
  location TEXT,
  radius INTEGER,
  category TEXT,
  created_at TIMESTAMPTZ,
  filters JSONB,
  result_count INTEGER
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT s.id, s.query, s.location, s.radius, s.category, s.created_at, s.filters, s.result_count
  FROM searches s
  WHERE s.user_id = get_user_searches.user_id
  ORDER BY s.created_at DESC;
$$;

-- SECTION 8: Success message
DO $$
BEGIN
  RAISE NOTICE '
  ╔════════════════════════════════════════════════════════════════╗
  ║                         SUCCESS                                ║
  ║ The MapLeads database schema has been successfully created.    ║
  ║ All tables, indexes, policies, and functions are now in place. ║
  ╚════════════════════════════════════════════════════════════════╝
  ';
END $$;

-- Commit the transaction
COMMIT;
