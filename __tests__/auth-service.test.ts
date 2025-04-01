/**
 * @jest-environment node
 */

import { supabase } from '@/lib/supabase';

// Mock the supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
    },
  },
}));

// Create a simple auth service for testing
const authService = {
  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password });
  },
  async signUp(email: string, password: string) {
    return await supabase.auth.signUp({ email, password });
  },
  async resetPassword(email: string) {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/reset-password',
    });
  },
  async signOut() {
    return await supabase.auth.signOut();
  },
  async getSession() {
    return await supabase.auth.getSession();
  }
};

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Sign In', () => {
    it('should call Supabase signInWithPassword with correct credentials', async () => {
      // Mock successful sign in
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { 
          user: { id: 'user-123', email: 'test@example.com' },
          session: { user: { id: 'user-123', email: 'test@example.com' } }
        },
        error: null,
      });

      // Call the service
      const result = await authService.signIn('test@example.com', 'password123');

      // Verify supabase was called with correct params
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      // Verify result
      expect(result.error).toBeNull();
      expect(result.data.user.email).toBe('test@example.com');
    });

    it('should handle sign in errors', async () => {
      // Mock sign in error
      const mockError = { message: 'Invalid login credentials' };
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      // Call the service with wrong credentials
      const result = await authService.signIn('test@example.com', 'wrong-password');

      // Verify error
      expect(result.error).toBe(mockError);
      expect(result.error.message).toBe('Invalid login credentials');
    });
  });

  describe('Sign Up', () => {
    it('should call Supabase signUp with correct credentials', async () => {
      // Mock successful sign up
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: { id: 'new-user-id', email: 'new@example.com' } },
        error: null,
      });

      // Call the service
      const result = await authService.signUp('new@example.com', 'Password123');

      // Verify supabase was called with correct params
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'Password123',
      });

      // Verify result
      expect(result.error).toBeNull();
      expect(result.data.user.email).toBe('new@example.com');
    });

    it('should handle sign up errors', async () => {
      // Mock sign up error
      const mockError = { message: 'Email already in use' };
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: mockError,
      });

      // Call the service with existing email
      const result = await authService.signUp('existing@example.com', 'Password123');

      // Verify error
      expect(result.error).toBe(mockError);
      expect(result.error.message).toBe('Email already in use');
    });
  });

  describe('Reset Password', () => {
    it('should call Supabase resetPasswordForEmail with correct email', async () => {
      // Mock successful password reset
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        data: {},
        error: null,
      });

      // Call the service
      const result = await authService.resetPassword('test@example.com');

      // Verify supabase was called with correct params
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: 'http://localhost:3000/reset-password' }
      );

      // Verify result
      expect(result.error).toBeNull();
    });

    it('should handle password reset errors', async () => {
      // Mock password reset error
      const mockError = { message: 'Email not found' };
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        data: {},
        error: mockError,
      });

      // Call the service with non-existent email
      const result = await authService.resetPassword('nonexistent@example.com');

      // Verify error
      expect(result.error).toBe(mockError);
      expect(result.error.message).toBe('Email not found');
    });
  });

  describe('Sign Out', () => {
    it('should call Supabase signOut', async () => {
      // Mock successful sign out
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      // Call the service
      const result = await authService.signOut();

      // Verify supabase was called
      expect(supabase.auth.signOut).toHaveBeenCalled();

      // Verify result
      expect(result.error).toBeNull();
    });
  });

  describe('Get Session', () => {
    it('should call Supabase getSession', async () => {
      // Mock session response
      const mockSession = { user: { id: 'user-123', email: 'test@example.com' } };
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      // Call the service
      const result = await authService.getSession();

      // Verify supabase was called
      expect(supabase.auth.getSession).toHaveBeenCalled();

      // Verify result
      expect(result.error).toBeNull();
      expect(result.data.session).toBe(mockSession);
    });

    it('should handle getSession errors', async () => {
      // Mock getSession error
      const mockError = { message: 'Session error' };
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: mockError,
      });

      // Call the service
      const result = await authService.getSession();

      // Verify error
      expect(result.error).toBe(mockError);
      expect(result.error.message).toBe('Session error');
    });
  });
});
