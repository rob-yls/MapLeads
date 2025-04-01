import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/components/protected-route'
import LoginPage from '@/components/pages/login-page'

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn().mockReturnValue({
    get: jest.fn(),
  }),
}))

// Mock the auth hook
jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn(),
}))

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn().mockReturnValue({
    toast: jest.fn(),
  }),
}))

describe('Protected Routes Integration', () => {
  const mockPush = jest.fn()
  const mockRouter = { push: mockPush }
  const mockSignIn = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  test('unauthenticated user is redirected from protected route to login', async () => {
    // Setup: User is not authenticated
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      isLoading: false,
    })

    // Mock window.location.pathname
    Object.defineProperty(window, 'location', {
      value: { pathname: '/dashboard' },
      writable: true,
    })

    // Render a protected route
    render(
      <ProtectedRoute>
        <div>Dashboard Content</div>
      </ProtectedRoute>
    )

    // Verify redirect to login page with redirectTo parameter
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login?redirectTo=%2Fdashboard')
    })
  })

  test('login page handles redirectTo parameter after successful authentication', async () => {
    // Setup: Mock redirectTo parameter
    const mockGet = jest.fn().mockReturnValue('/dashboard')
    ;(useRouter as jest.Mock)().useSearchParams = {
      get: mockGet,
    }

    // Mock successful authentication
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      isLoading: false,
      signIn: mockSignIn.mockResolvedValue({ error: null }),
    })

    // Render login page
    const { container } = render(<LoginPage />)
    
    // Get inputs by their placeholder text
    const emailInput = screen.getByPlaceholderText('name@example.com')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    
    // Fill in login form
    fireEvent.change(emailInput, {
      target: { value: 'test@example.com' },
    })
    
    fireEvent.change(passwordInput, {
      target: { value: 'password123' },
    })

    // Submit form - find the button by its text content
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)

    // Verify redirect to the original URL after successful login
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  test('authenticated user can access protected content', () => {
    // Setup: User is authenticated
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { id: 'test-user-id', email: 'test@example.com' },
      isLoading: false,
    })

    // Render a protected route
    render(
      <ProtectedRoute>
        <div>Protected Dashboard Content</div>
      </ProtectedRoute>
    )

    // Verify protected content is rendered
    expect(screen.getByText('Protected Dashboard Content')).toBeInTheDocument()
    
    // Verify no redirect occurred
    expect(mockPush).not.toHaveBeenCalled()
  })

  test('shows loading state while checking authentication', () => {
    // Setup: Authentication is loading
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      isLoading: true,
    })

    // Render a protected route
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    // Verify loading spinner is shown
    expect(screen.getByRole('status')).toBeInTheDocument()
    
    // Verify protected content is not rendered
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    
    // Verify no redirect occurred yet
    expect(mockPush).not.toHaveBeenCalled()
  })
})
