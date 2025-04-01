"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If authentication is still loading, do nothing yet
    if (isLoading) return

    // If no user is found after loading completes, redirect to login
    if (!user) {
      router.push(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`)
    }
  }, [user, isLoading, router])

  // Show nothing while loading or if no user
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    )
  }

  // If user exists, render the protected content
  return <>{children}</>
}
