/**
 * Search Page Component Tests
 * 
 * Tests for the search page component, focusing on:
 * - Basic component rendering
 * - Search form presence
 * - Results table structure
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import SearchPage from '@/components/pages/search-page';

// Mock the components used by SearchPage
jest.mock('@/components/search-form', () => ({
  SearchForm: () => <div data-testid="search-form">Search Form</div>
}));

jest.mock('@/components/filter-section', () => ({
  FilterSection: () => <div data-testid="filter-section">Filter Section</div>
}));

jest.mock('@/components/results-table', () => ({
  ResultsTable: () => <div data-testid="results-table">Results Table</div>
}));

jest.mock('@/components/chat-panel', () => ({
  ChatPanel: () => <div data-testid="chat-panel">Chat Panel</div>
}));

jest.mock('@/components/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="theme-provider">{children}</div>
}));

// Mock the next/navigation functions
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn()
  }),
  useSearchParams: () => ({
    get: jest.fn()
  }),
  usePathname: () => '/search'
}));

describe('SearchPage Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });
  
  it('should render the search form and results components', () => {
    render(<SearchPage />);
    
    // Check if the search form is rendered
    expect(screen.getByTestId('search-form')).toBeInTheDocument();
    
    // The results table should be present
    expect(screen.getByTestId('results-table')).toBeInTheDocument();
  });
});
