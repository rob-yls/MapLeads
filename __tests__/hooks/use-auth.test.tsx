import { renderHook, act } from '@testing-library/react';
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
    await act(async () => {
      await Promise.resolve();
    });
    
    // After initialization, loading should be false
    expect(result.current.isLoading).toBe(false);
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
    await act(async () => {
      await Promise.resolve();
    });
    
    // Perform sign in
    await act(async () => {
      const response = await result.current.signIn('test@example.com', 'password123');
      expect(response.error).toBeNull();
    });
    
    // Verify supabase was called with correct params
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
    await act(async () => {
      await Promise.resolve();
    });
    
    // Perform sign in
    await act(async () => {
      const response = await result.current.signIn('test@example.com', 'wrong-password');
      expect(response.error).toBe(mockError);
    });
  });

  test('should sign up user successfully', async () => {
    // Mock successful sign up
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: { id: 'new-user-123', email: 'new@example.com' } },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for initialization
    await act(async () => {
      await Promise.resolve();
    });
    
    // Perform sign up
    await act(async () => {
      const response = await result.current.signUp('new@example.com', 'newpassword123');
      expect(response.error).toBeNull();
    });
    
    // Verify supabase was called with correct params
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
    await act(async () => {
      await Promise.resolve();
    });
    
    // Perform password reset
    await act(async () => {
      const response = await result.current.resetPassword('test@example.com');
      expect(response.error).toBeNull();
    });
    
    // Verify supabase was called with correct params
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
    await act(async () => {
      await Promise.resolve();
    });
    
    // Perform sign out
    await act(async () => {
      await result.current.signOut();
    });
    
    // Verify supabase was called
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});
