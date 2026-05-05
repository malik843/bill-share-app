import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Lightweight middleware that checks for the NextAuth session token cookie.
 * Does NOT import the heavy auth config (Prisma/pg) to stay Edge-compatible.
 * The actual auth verification happens server-side in the route handlers.
 */
export function middleware(request: NextRequest) {
  // NextAuth v5 JWT session cookie names
  const sessionToken =
    request.cookies.get('authjs.session-token')?.value ||
    request.cookies.get('__Secure-authjs.session-token')?.value

  if (!sessionToken) {
    const signInUrl = new URL('/register', request.url)
    signInUrl.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*'],
}
