import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from '@/components/pages/register-page';
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

describe('RegisterPage', () => {
  const mockSignUp = jest.fn();
  const mockToast = jest.fn();
  const mockRouterPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    (useAuth as jest.Mock).mockReturnValue({
      signUp: mockSignUp,
    });
    
    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });
    
    // Mock router
    jest.spyOn(require('next/navigation'), 'useRouter').mockImplementation(() => ({
      push: mockRouterPush,
    }));
  });

  test('renders registration form correctly', () => {
    render(<RegisterPage />);
    
    // Check if the form elements are rendered
    expect(screen.getByText('Create an account')).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/terms/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  });

  test('validates form inputs', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    
    // Submit form without filling inputs
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    // Check for validation errors
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    expect(await screen.findByText(/please confirm your password/i)).toBeInTheDocument();
    expect(await screen.findByText(/you must agree to the terms and conditions/i)).toBeInTheDocument();
  });

  test('validates password requirements', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    
    // Enter a password that doesn't meet requirements
    await user.type(screen.getByLabelText(/^password$/i), 'password');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    // Check for password validation errors
    expect(await screen.findByText(/password must contain at least one uppercase letter/i)).toBeInTheDocument();
    expect(await screen.findByText(/password must contain at least one number/i)).toBeInTheDocument();
    
    // Update with a better password but not matching confirm
    await user.clear(screen.getByLabelText(/^password$/i));
    await user.type(screen.getByLabelText(/^password$/i), 'Password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password124');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    // Check for password match error
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  test('submits form with valid data and registers successfully', async () => {
    const user = userEvent.setup();
    
    // Mock successful registration
    mockSignUp.mockResolvedValue({ error: null });
    
    render(<RegisterPage />);
    
    // Fill form with valid data
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123');
    await user.click(screen.getByLabelText(/terms/i));
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    // Verify sign up was called with correct data
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('john@example.com', 'Password123');
    });
    
    // Verify success toast was shown
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Account created',
        description: 'Please check your email to confirm your account.',
      });
    });
    
    // Verify redirect to login page
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/login');
    });
  });

  test('handles registration error', async () => {
    const user = userEvent.setup();
    
    // Mock registration error
    const mockError = { message: 'Email already in use' };
    mockSignUp.mockResolvedValue({ error: mockError });
    
    render(<RegisterPage />);
    
    // Fill form with valid data
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123');
    await user.click(screen.getByLabelText(/terms/i));
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    // Verify sign up was called
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalled();
    });
    
    // Verify error toast was shown
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Registration error',
        description: 'Email already in use',
        variant: 'destructive',
      });
    });
    
    // Verify no redirect happened
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  test('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    
    // Password fields should be hidden by default
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    
    // Click the toggle buttons
    const toggleButtons = screen.getAllByRole('button', { name: /show password/i });
    await user.click(toggleButtons[0]); // Password field toggle
    
    // Password should now be visible
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Confirm password should still be hidden
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    
    // Toggle confirm password
    await user.click(toggleButtons[1]); // Confirm password field toggle
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');
  });

  test('navigates to login page', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    
    // Click the sign in link
    await user.click(screen.getByText(/sign in/i));
    
    // Verify navigation
    expect(mockRouterPush).toHaveBeenCalledWith('/login');
  });
});
