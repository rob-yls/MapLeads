import { render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/components/protected-route'

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock the auth hook
jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn(),
}))

describe('ProtectedRoute', () => {
  const mockPush = jest.fn()
  const mockRouter = { push: mockPush }
  
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  test('renders loading spinner when authentication is loading', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      isLoading: true,
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    // Should show loading spinner
    expect(screen.getByRole('status')).toBeInTheDocument()
    
    // Should not render children
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    
    // Should not redirect
    expect(mockPush).not.toHaveBeenCalled()
  })

  test('redirects to login when user is not authenticated', async () => {
    // Mock window.location.pathname
    Object.defineProperty(window, 'location', {
      value: { pathname: '/dashboard' },
      writable: true,
    })

    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      isLoading: false,
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    // Should redirect to login with the current path as redirectTo
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login?redirectTo=%2Fdashboard')
    })
    
    // Should show loading spinner
    expect(screen.getByRole('status')).toBeInTheDocument()
    
    // Should not render children
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  test('renders children when user is authenticated', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { id: 'test-user-id', email: 'test@example.com' },
      isLoading: false,
    })

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    // Should render children
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    
    // Should not redirect
    expect(mockPush).not.toHaveBeenCalled()
  })
})
