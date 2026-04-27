export { auth as middleware } from '@/lib/auth'

export const config = {
  // Protect dashboard and onboarding routes
  // Skip API routes, static files, images, and the register page itself
  matcher: ['/dashboard/:path*', '/onboarding/:path*'],
}
