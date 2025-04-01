/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
}));

describe('Authentication Flow', () => {
  test('Login page renders correctly', async () => {
    render(<LoginPage />);
    
    // Check if the main elements are rendered
    expect(screen.getByText(/sign in/i)).toBeTruthy();
    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/password/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy();
  });

  test('Register page renders correctly', async () => {
    render(<RegisterPage />);
    
    // Check if the main elements are rendered
    expect(screen.getByText(/create an account/i)).toBeTruthy();
    expect(screen.getByLabelText(/full name/i)).toBeTruthy();
    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/^password$/i)).toBeTruthy();
    expect(screen.getByLabelText(/confirm password/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /create account/i })).toBeTruthy();
  });

  test('Forgot password page renders correctly', async () => {
    render(<ForgotPasswordPage />);
    
    // Check if the main elements are rendered
    expect(screen.getByText(/reset password/i)).toBeTruthy();
    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeTruthy();
  });

  test('Logout button renders correctly', async () => {
    render(<LogoutButton />);
    
    // Check if the button is rendered
    expect(screen.getByRole('button')).toBeTruthy();
  });
});
