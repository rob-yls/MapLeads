import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth, AuthProvider } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { ReactNode } from 'react';

// Mock the supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      })),
    },
  },
}));

// Mock the next/navigation router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock window.location.origin
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000',
  },
  writable: true,
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock getSession to return no session by default
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  test('should initialize with no user and loading state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Initial state should be loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBe(null);
    expect(result.current.session).toBe(null);
    
    // Wait for initialization to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 5000 });
  });

  test('should sign in user successfully', async () => {
    // Mock successful sign in
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { 
        user: { id: 'user-123', email: 'test@example.com' },
        session: { user: { id: 'user-123', email: 'test@example.com' } }
      },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for initialization
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 5000 });
    
    // Perform sign in
    let signInResponse: { error: any } | undefined;
    await act(async () => {
      signInResponse = await result.current.signIn('test@example.com', 'password123');
    });
    
    // Verify response and supabase call
    expect(signInResponse?.error).toBeNull();
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  test('should handle sign in error', async () => {
    // Mock sign in error
    const mockError = { message: 'Invalid credentials' };
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: null, session: null },
      error: mockError,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for initialization
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 5000 });
    
    // Perform sign in
    let signInResponse: { error: any } | undefined;
    await act(async () => {
      signInResponse = await result.current.signIn('test@example.com', 'wrong-password');
    });
    
    // Verify error response
    expect(signInResponse?.error).toBe(mockError);
  });

  test('should sign up user successfully', async () => {
    // Mock successful sign up
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: { id: 'new-user-123', email: 'new@example.com' } },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for initialization
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 5000 });
    
    // Perform sign up
    let signUpResponse: { error: any } | undefined;
    await act(async () => {
      signUpResponse = await result.current.signUp('new@example.com', 'newpassword123');
    });
    
    // Verify response and supabase call
    expect(signUpResponse?.error).toBeNull();
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'newpassword123',
    });
  });

  test('should reset password successfully', async () => {
    // Mock successful password reset
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
      data: {},
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for initialization
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 5000 });
    
    // Perform password reset
    let resetResponse: { error: any } | undefined;
    await act(async () => {
      resetResponse = await result.current.resetPassword('test@example.com');
    });
    
    // Verify response and supabase call
    expect(resetResponse?.error).toBeNull();
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.com',
      { redirectTo: 'http://localhost:3000/reset-password' }
    );
  });

  test('should sign out user successfully', async () => {
    // Mock successful sign out
    (supabase.auth.signOut as jest.Mock).mockResolvedValue({
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for initialization
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 5000 });
    
    // Perform sign out
    await act(async () => {
      await result.current.signOut();
    });
    
    // Verify supabase was called
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});
