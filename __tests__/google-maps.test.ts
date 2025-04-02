/**
 * Google Maps Service Tests
 * 
 * Tests for the Google Maps service functionality, including:
 * - Place transformation functions
 * - Address component parsing
 * - API integration
 */

import { transformPlaceToBusinessPartial, transformPlaceToBusinessFull, formatCategory, GoogleMapsPlaceResult } from '../lib/google-maps';
import type { Business } from '../types/database';

// Mock data for testing
const mockPlaceResult: GoogleMapsPlaceResult = {
  place_id: 'test_place_id',
  name: 'Test Business Name',
  formatted_address: '123 Test St, Test City, TS 12345, USA',
  address_components: [
    {
      long_name: '123',
      short_name: '123',
      types: ['street_number']
    },
    {
      long_name: 'Test St',
      short_name: 'Test St',
      types: ['route']
    },
    {
      long_name: 'Test City',
      short_name: 'Test City',
      types: ['locality', 'political']
    },
    {
      long_name: 'Test County',
      short_name: 'Test County',
      types: ['administrative_area_level_2', 'political']
    },
    {
      long_name: 'Test State',
      short_name: 'TS',
      types: ['administrative_area_level_1', 'political']
    },
    {
      long_name: '12345',
      short_name: '12345',
      types: ['postal_code']
    },
    {
      long_name: 'United States',
      short_name: 'US',
      types: ['country', 'political']
    }
  ],
  geometry: {
    location: {
      lat: 37.7749,
      lng: -122.4194
    }
  },
  types: ['restaurant', 'food', 'point_of_interest', 'establishment'],
  rating: 4.5,
  user_ratings_total: 100,
  price_level: 2,
  formatted_phone_number: '(555) 123-4567',
  international_phone_number: '+1 555-123-4567',
  website: 'https://www.testbusiness.com',
  editorial_summary: {
    overview: 'A great test business with excellent service.',
    language: 'en'
  }
};

// Mock place result without editorial summary
const mockPlaceWithoutEditorialSummary: GoogleMapsPlaceResult = {
  ...mockPlaceResult,
  editorial_summary: undefined
};

describe('Google Maps Service', () => {
  describe('transformPlaceToBusinessPartial', () => {
    it('should transform a place result to a partial business object', () => {
      const result = transformPlaceToBusinessPartial(mockPlaceResult);
      
      // Check basic fields
      expect(result.google_place_id).toBe('test_place_id');
      expect(result.name).toBe('Test Business Name');
      
      // Check location
      expect(result.latitude).toBe(37.7749);
      expect(result.longitude).toBe(-122.4194);
      
      // Check additional fields we added
      expect(result.phone).toBe('(555) 123-4567');
      expect(result.website).toBe('https://www.testbusiness.com');
      expect(result.description).toBe('A great test business with excellent service.');
      
      // Email should be undefined as Google Places API doesn't provide it
      expect(result.email).toBeUndefined();
      
      // Check that a Google Map URL was generated
      expect(typeof result.googleMapUrl).toBe('string');
      expect(result.googleMapUrl).toContain('test_place_id');
    });
    
    it('should use categories as description when editorial_summary is not available', () => {
      const result = transformPlaceToBusinessPartial(mockPlaceWithoutEditorialSummary);
      
      // Description should fall back to formatted categories
      expect(result.description).toBe('Restaurant, Food, Point Of Interest, Establishment');
    });
  });
  
  describe('transformPlaceToBusinessFull', () => {
    it('should transform a place result to a full business object', () => {
      const result = transformPlaceToBusinessFull(mockPlaceResult);
      
      // Check basic fields
      expect(result.google_place_id).toBe('test_place_id');
      expect(result.name).toBe('Test Business Name');
      expect(result.formatted_address).toBe('123 Test St, Test City, TS 12345, USA');
      
      // Check address components
      expect(result.address).toBe('123 Test St');
      expect(result.city).toBe('Test City');
      expect(result.state).toBe('TS');
      expect(result.postal_code).toBe('12345');
      expect(result.country).toBe('United States');
      
      // Check location
      expect(result.latitude).toBe(37.7749);
      expect(result.longitude).toBe(-122.4194);
      
      // Check additional fields we added
      expect(result.phone).toBe('(555) 123-4567');
      expect(result.website).toBe('https://www.testbusiness.com');
      expect(result.description).toBe('A great test business with excellent service.');
      
      // Email should be undefined as Google Places API doesn't provide it
      expect(result.email).toBeUndefined();
      
      // Check that a Google Map URL was generated
      expect(typeof result.googleMapUrl).toBe('string');
      expect(result.googleMapUrl).toContain('test_place_id');
      
      // Check additional fields in the full business object
      expect(Array.isArray(result.categories)).toBe(true);
    });
    
    it('should use categories as description when editorial_summary is not available', () => {
      const result = transformPlaceToBusinessFull(mockPlaceWithoutEditorialSummary);
      
      // Description should fall back to formatted categories
      expect(result.description).toBe('Restaurant, Food, Point Of Interest, Establishment');
    });
  });
  
  describe('formatCategory', () => {
    it('should format snake_case categories to Title Case', () => {
      expect(formatCategory('restaurant')).toBe('Restaurant');
      expect(formatCategory('fast_food')).toBe('Fast Food');
      expect(formatCategory('point_of_interest')).toBe('Point Of Interest');
    });
  });
});
