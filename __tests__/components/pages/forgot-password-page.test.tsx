import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordPage from '@/components/pages/forgot-password-page';
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

describe('ForgotPasswordPage', () => {
  const mockResetPassword = jest.fn();
  const mockToast = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    (useAuth as jest.Mock).mockReturnValue({
      resetPassword: mockResetPassword,
    });
    
    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });
  });

  test('renders forgot password form correctly', () => {
    render(<ForgotPasswordPage />);
    
    // Check if the form elements are rendered
    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    expect(screen.getByText(/back to login/i)).toBeInTheDocument();
  });

  test('submits form with valid email and resets password successfully', async () => {
    const user = userEvent.setup();
    
    // Mock successful password reset
    mockResetPassword.mockResolvedValue({ error: null });
    
    render(<ForgotPasswordPage />);
    
    // Fill form with valid email
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /send reset link/i }));
    
    // Verify resetPassword was called with correct email
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
    });
    
    // Verify success toast was shown
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Reset link sent',
        description: 'Please check your email for password reset instructions.',
      });
    });
  });

  test('handles password reset error', async () => {
    const user = userEvent.setup();
    
    // Mock password reset error
    const mockError = { message: 'Email not found' };
    mockResetPassword.mockResolvedValue({ error: mockError });
    
    render(<ForgotPasswordPage />);
    
    // Fill form with valid email
    await user.type(screen.getByLabelText(/email/i), 'nonexistent@example.com');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /send reset link/i }));
    
    // Verify resetPassword was called
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalled();
    });
    
    // Verify error toast was shown
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Email not found',
        variant: 'destructive',
      });
    });
  });

  test('navigates back to login page', async () => {
    const user = userEvent.setup();
    const mockRouterPush = jest.fn();
    
    // Mock router
    jest.spyOn(require('next/navigation'), 'useRouter').mockImplementation(() => ({
      push: mockRouterPush,
    }));
    
    render(<ForgotPasswordPage />);
    
    // Since we're using Next.js Link, we need to check if the link has the correct href
    const backToLoginLink = screen.getByText(/back to login/i).closest('a');
    expect(backToLoginLink).toHaveAttribute('href', '/login');
  });
});
