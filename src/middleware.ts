import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth(function middleware(req) {
  const isPro = (req.auth as any)?.plan === 'PRO'
  const isProApiRoute = req.nextUrl.pathname.startsWith('/api/pro')

  if (isProApiRoute && !isPro) {
    return NextResponse.json(
      { error: 'Pro subscription required', upgrade: true },
      { status: 403 }
    )
  }
})

export const config = {
  matcher: [
    // App Router pages only
    '/dashboard/:path*',
    '/groups/:path*',
    '/settle/:path*',
    // App Router API routes only
    '/api/groups/:path*',
    '/api/pro/:path*',
    '/api/pay/initialize',
    // Excluded intentionally:
    // /api/auth — NextAuth handler, no session needed
    // /api/health — public
    // /api/pay/webhook — signature-only guard, no session
  ]
}
