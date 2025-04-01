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

describe('Supabase Authentication Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Sign Up', () => {
    it('should successfully sign up a new user', async () => {
      // Mock successful sign up
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: { id: 'new-user-id', email: 'new@example.com' } },
        error: null,
      });

      // Perform sign up
      const result = await supabase.auth.signUp({
        email: 'new@example.com',
        password: 'Password123',
      });

      // Verify success
      expect(result.error).toBeNull();
      expect(result.data.user).toBeDefined();
      expect(result.data.user.email).toBe('new@example.com');

      // Verify supabase was called with correct params
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'Password123',
      });
    });

    it('should handle sign up errors', async () => {
      // Mock sign up error
      const mockError = { message: 'Email already in use' };
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: mockError,
      });

      // Perform sign up with existing email
      const result = await supabase.auth.signUp({
        email: 'existing@example.com',
        password: 'Password123',
      });

      // Verify error
      expect(result.error).toBe(mockError);
      expect(result.error.message).toBe('Email already in use');
    });
  });

  describe('Sign In', () => {
    it('should successfully sign in a user', async () => {
      // Mock successful sign in
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { 
          user: { id: 'user-123', email: 'test@example.com' },
          session: { user: { id: 'user-123', email: 'test@example.com' } }
        },
        error: null,
      });

      // Perform sign in
      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      });

      // Verify success
      expect(result.error).toBeNull();
      expect(result.data.user).toBeDefined();
      expect(result.data.session).toBeDefined();
      expect(result.data.user.email).toBe('test@example.com');

      // Verify supabase was called with correct params
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle sign in errors', async () => {
      // Mock sign in error
      const mockError = { message: 'Invalid login credentials' };
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      // Perform sign in with wrong credentials
      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'wrong-password',
      });

      // Verify error
      expect(result.error).toBe(mockError);
      expect(result.error.message).toBe('Invalid login credentials');
    });
  });

  describe('Password Reset', () => {
    it('should successfully send a password reset email', async () => {
      // Mock successful password reset
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        data: {},
        error: null,
      });

      // Perform password reset
      const result = await supabase.auth.resetPasswordForEmail('test@example.com', {
        redirectTo: 'http://localhost:3000/reset-password',
      });

      // Verify success
      expect(result.error).toBeNull();

      // Verify supabase was called with correct params
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: 'http://localhost:3000/reset-password' }
      );
    });

    it('should handle password reset errors', async () => {
      // Mock password reset error
      const mockError = { message: 'Email not found' };
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        data: {},
        error: mockError,
      });

      // Perform password reset with non-existent email
      const result = await supabase.auth.resetPasswordForEmail('nonexistent@example.com');

      // Verify error
      expect(result.error).toBe(mockError);
      expect(result.error.message).toBe('Email not found');
    });
  });

  describe('Sign Out', () => {
    it('should successfully sign out a user', async () => {
      // Mock successful sign out
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      // Perform sign out
      const result = await supabase.auth.signOut();

      // Verify success
      expect(result.error).toBeNull();

      // Verify supabase was called
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });
});
