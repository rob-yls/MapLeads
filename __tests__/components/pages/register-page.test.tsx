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
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Create a password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  test('submits form with valid data and registers successfully', async () => {
    const user = userEvent.setup();
    
    // Mock successful registration
    mockSignUp.mockResolvedValue({ error: null });
    
    render(<RegisterPage />);
    
    // Fill form with valid data
    await user.type(screen.getByPlaceholderText('John Doe'), 'John Doe');
    await user.type(screen.getByPlaceholderText('name@example.com'), 'john@example.com');
    await user.type(screen.getByPlaceholderText('Create a password'), 'Password123');
    await user.type(screen.getByPlaceholderText('Confirm your password'), 'Password123');
    
    // Find and click the terms checkbox
    const termsCheckbox = screen.getByRole('checkbox');
    await user.click(termsCheckbox);
    
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
    await user.type(screen.getByPlaceholderText('John Doe'), 'John Doe');
    await user.type(screen.getByPlaceholderText('name@example.com'), 'existing@example.com');
    await user.type(screen.getByPlaceholderText('Create a password'), 'Password123');
    await user.type(screen.getByPlaceholderText('Confirm your password'), 'Password123');
    
    // Find and click the terms checkbox
    const termsCheckbox = screen.getByRole('checkbox');
    await user.click(termsCheckbox);
    
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
});
