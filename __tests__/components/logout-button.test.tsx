import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LogoutButton } from '@/components/logout-button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

// Mock the hooks
jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

describe('LogoutButton', () => {
  const mockSignOut = jest.fn();
  const mockToast = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    (useAuth as jest.Mock).mockReturnValue({
      signOut: mockSignOut,
    });
    
    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });
  });

  test('renders logout button correctly', () => {
    render(<LogoutButton />);
    
    // Check if the button is rendered
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
    // The text is in a screen reader only span, so we check for the button with the accessible name
  });

  test('calls signOut when clicked', async () => {
    const user = userEvent.setup();
    
    // Mock successful sign out
    mockSignOut.mockResolvedValue(undefined);
    
    render(<LogoutButton />);
    
    // Click the logout button
    await user.click(screen.getByRole('button'));
    
    // Verify signOut was called
    expect(mockSignOut).toHaveBeenCalled();
    
    // Verify success toast was shown
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
  });

  test('handles sign out error', async () => {
    const user = userEvent.setup();
    
    // Mock sign out error
    mockSignOut.mockRejectedValue(new Error('Sign out failed'));
    
    render(<LogoutButton />);
    
    // Click the logout button
    await user.click(screen.getByRole('button'));
    
    // Verify signOut was called
    expect(mockSignOut).toHaveBeenCalled();
    
    // Verify error toast was shown
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'There was a problem logging you out. Please try again.',
      variant: 'destructive',
    });
  });

  test('disables button during sign out process', async () => {
    const user = userEvent.setup();
    
    // Create a promise that we can resolve manually to control the timing
    let resolveSignOut: (value: void | PromiseLike<void>) => void;
    const signOutPromise = new Promise<void>((resolve) => {
      resolveSignOut = resolve;
    });
    
    mockSignOut.mockReturnValue(signOutPromise);
    
    render(<LogoutButton />);
    
    // Button should be enabled initially
    const button = screen.getByRole('button', { name: /logout/i });
    expect(button).not.toBeDisabled();
    
    // Click the logout button
    const clickPromise = user.click(button);
    
    // Wait for the state to update (button to be disabled)
    await waitFor(() => {
      expect(button).toBeDisabled();
    });
    
    // Resolve the sign out promise
    resolveSignOut!();
    
    // Wait for the click handler to complete
    await clickPromise;
    
    // Wait for the state to update (button to be enabled again)
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });
});
