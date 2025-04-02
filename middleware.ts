import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password']

// DEVELOPMENT ONLY: Set this to true to bypass authentication checks
const BYPASS_AUTH_FOR_DEVELOPMENT = true

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // DEVELOPMENT ONLY: Skip authentication checks if bypass is enabled
  if (process.env.NODE_ENV !== 'production' && BYPASS_AUTH_FOR_DEVELOPMENT) {
    console.log('Development mode: Bypassing authentication checks');
    return res;
  }
  
  try {
    // Create the Supabase middleware client
    const supabase = createMiddlewareClient({ req, res })
    
    // Check if the path is in the public routes
    const isPublicRoute = publicRoutes.some(route => 
      req.nextUrl.pathname === route || req.nextUrl.pathname === '/'
    )
    
    // Try to get the session
    const { data: { session } } = await supabase.auth.getSession()
    
    // If no session and trying to access protected route, redirect to login
    if (!session && !isPublicRoute) {
      const redirectUrl = new URL('/login', req.url)
      // Add the original URL as a query parameter so we can redirect back after login
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    return res
  } catch (error) {
    console.error('Middleware error:', error)
    
    // If there's an error with Supabase (like missing env vars), 
    // we'll just continue without auth checks for development purposes
    // In production, you would want to handle this differently
    return res
  }
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
}
