/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import LoginPage from '@/components/pages/login-page';
import RegisterPage from '@/components/pages/register-page';
import ForgotPasswordPage from '@/components/pages/forgot-password-page';
import { LogoutButton } from '@/components/logout-button';

// Mock the hooks
jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    signIn: jest.fn().mockResolvedValue({ error: null }),
    signUp: jest.fn().mockResolvedValue({ error: null }),
    signOut: jest.fn().mockResolvedValue(undefined),
    resetPassword: jest.fn().mockResolvedValue({ error: null }),
    user: null,
    session: null,
    isLoading: false,
  }),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue('/dashboard'),
  }),
}));

// Add this to handle the act() warnings
beforeAll(() => {
  // Suppress React 19 act() warnings
  const originalError = console.error;
  console.error = (...args) => {
    if (/Warning.*not wrapped in act/.test(args[0])) {
      return;
    }
    originalError.call(console, ...args);
  };
});

// Mock the form components to avoid issues with form validation
jest.mock('@/components/ui/form', () => {
  const actual = jest.requireActual('@/components/ui/form');
  return {
    ...actual,
    FormItem: ({ children }: { children: React.ReactNode }) => <div data-testid="form-item">{children}</div>,
    FormLabel: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
    FormControl: ({ children }: { children: React.ReactNode }) => <div data-testid="form-control">{children}</div>,
    FormMessage: () => null,
    Form: ({ children }: { children: React.ReactNode }) => <div data-testid="form">{children}</div>,
  };
});

describe('Authentication Flow', () => {
  test('Login page renders correctly', () => {
    render(<LoginPage />);
    
    // Check for the MapLeads title in the header
    expect(screen.getByText('MapLeads')).toBeInTheDocument();
    
    // Check for the card title
    expect(screen.getByText('Sign in', { selector: '.text-2xl' })).toBeInTheDocument();
    
    // Check for the description
    expect(screen.getByText('Enter your email and password to access your account')).toBeInTheDocument();
  });

  test('Register page renders correctly', () => {
    render(<RegisterPage />);
    
    // Check for the MapLeads title in the header
    expect(screen.getByText('MapLeads')).toBeInTheDocument();
    
    // Check for the card title
    expect(screen.getByText('Create an account', { selector: '.text-2xl' })).toBeInTheDocument();
  });

  test('Forgot password page renders correctly', () => {
    render(<ForgotPasswordPage />);
    
    // Check for the MapLeads title in the header
    expect(screen.getByText('MapLeads')).toBeInTheDocument();
    
    // Check for the card title
    expect(screen.getByText('Reset Password', { selector: '.text-2xl' })).toBeInTheDocument();
  });

  test('Logout button renders correctly', () => {
    render(<LogoutButton />);
    
    // Check if the button is rendered with the accessible name "Logout"
    const logoutButton = screen.getByRole('button', { name: 'Logout' });
    expect(logoutButton).toBeInTheDocument();
  });
});
