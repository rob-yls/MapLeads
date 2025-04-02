-- MapLeads Initial Database Schema
-- This migration creates the initial database schema for the MapLeads application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
-- Note: The 'auth.users' table is automatically created by Supabase Auth

-- Searches table
CREATE TABLE IF NOT EXISTS searches (
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
CREATE TABLE IF NOT EXISTS businesses (
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
CREATE TABLE IF NOT EXISTS search_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  search_id UUID NOT NULL REFERENCES searches(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(search_id, business_id)
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS searches_user_id_idx ON searches(user_id);
CREATE INDEX IF NOT EXISTS businesses_google_place_id_idx ON businesses(google_place_id);
CREATE INDEX IF NOT EXISTS search_results_search_id_idx ON search_results(search_id);
CREATE INDEX IF NOT EXISTS search_results_business_id_idx ON search_results(business_id);
CREATE INDEX IF NOT EXISTS leads_user_id_idx ON leads(user_id);
CREATE INDEX IF NOT EXISTS leads_business_id_idx ON leads(business_id);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);

-- Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

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

-- Create functions for common operations
-- Function to get all businesses for a search
CREATE OR REPLACE FUNCTION get_search_businesses(search_id UUID)
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
CREATE OR REPLACE FUNCTION get_user_searches(user_id UUID)
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
