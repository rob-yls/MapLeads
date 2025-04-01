import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/components/pages/login-page';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

// Mock the hooks
jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue('/dashboard'),
  }),
}));

describe('LoginPage', () => {
  const mockSignIn = jest.fn();
  const mockToast = jest.fn();
  const mockRouterPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    (useAuth as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
    });
    
    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });
    
    // Mock router
    jest.spyOn(require('next/navigation'), 'useRouter').mockImplementation(() => ({
      push: mockRouterPush,
    }));
  });

  test('renders login form correctly', () => {
    render(<LoginPage />);
    
    // Check if the form elements are rendered - focus on reliable elements
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('submits form with valid data and signs in successfully', async () => {
    const user = userEvent.setup();
    
    // Mock successful sign in
    mockSignIn.mockResolvedValue({ error: null });
    
    render(<LoginPage />);
    
    // Fill form with valid data
    await user.type(screen.getByPlaceholderText('name@example.com'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Verify sign in was called with correct data
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
    
    // Verify redirect to dashboard
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('handles sign in error', async () => {
    const user = userEvent.setup();
    
    // Mock sign in error
    const mockError = { message: 'Invalid credentials' };
    mockSignIn.mockResolvedValue({ error: mockError });
    
    render(<LoginPage />);
    
    // Fill form with valid data
    await user.type(screen.getByPlaceholderText('name@example.com'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Enter your password'), 'wrong-password');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Verify sign in was called
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });
    
    // Verify toast error was shown
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Authentication error',
        description: 'Invalid credentials',
        variant: 'destructive',
      });
    });
    
    // Verify no redirect happened
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  test('navigates to forgot password page', () => {
    render(<LoginPage />);
    
    // Check if the forgot password link has the correct href
    const forgotPasswordLink = screen.getByText(/forgot password/i).closest('a');
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
  });

  test('navigates to register page', () => {
    render(<LoginPage />);
    
    // Check if the sign up link has the correct href
    const signUpLink = screen.getByText(/sign up/i).closest('a');
    expect(signUpLink).toHaveAttribute('href', '/register');
  });
});
