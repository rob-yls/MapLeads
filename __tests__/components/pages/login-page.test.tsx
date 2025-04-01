import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    
    // Check if the form elements are rendered
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByText(/create account/i)).toBeInTheDocument();
  });

  test('validates form inputs', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    
    // Submit form without filling inputs
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check for validation errors
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  test('validates email format', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    
    // Enter invalid email
    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check for validation error
    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
  });

  test('submits form with valid data and signs in successfully', async () => {
    const user = userEvent.setup();
    
    // Mock successful sign in
    mockSignIn.mockResolvedValue({ error: null });
    
    render(<LoginPage />);
    
    // Fill form with valid data
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
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
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrong-password');
    
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

  test('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    
    // Password should be hidden by default
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click the toggle button
    const toggleButton = screen.getByRole('button', { name: /show password/i });
    await user.click(toggleButton);
    
    // Password should now be visible
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click again to hide
    await user.click(toggleButton);
    
    // Password should be hidden again
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('navigates to forgot password page', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    
    // Click the forgot password link
    await user.click(screen.getByText(/forgot password/i));
    
    // Verify navigation
    expect(mockRouterPush).toHaveBeenCalledWith('/forgot-password');
  });

  test('navigates to register page', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    
    // Click the create account link
    await user.click(screen.getByText(/create account/i));
    
    // Verify navigation
    expect(mockRouterPush).toHaveBeenCalledWith('/register');
  });
});
