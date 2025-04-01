/**
 * @jest-environment jsdom
 */

import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';

// Mock the supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
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

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('Auth Context', () => {
  it('should provide authentication methods', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Verify auth methods are provided
    expect(result.current.signIn).toBeDefined();
    expect(result.current.signUp).toBeDefined();
    expect(result.current.signOut).toBeDefined();
    expect(result.current.resetPassword).toBeDefined();
  });
});
