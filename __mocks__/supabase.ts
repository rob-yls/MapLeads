// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getSession: jest.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
    signUp: jest.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      error: null,
    }),
    signInWithPassword: jest.fn().mockResolvedValue({
      data: { 
        user: { id: 'test-user-id', email: 'test@example.com' },
        session: { user: { id: 'test-user-id', email: 'test@example.com' } }
      },
      error: null,
    }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: jest.fn(() => ({
      data: {
        subscription: {
          unsubscribe: jest.fn(),
        },
      },
    })),
  },
};

export const supabase = mockSupabaseClient;
export const createClient = jest.fn(() => mockSupabaseClient);
