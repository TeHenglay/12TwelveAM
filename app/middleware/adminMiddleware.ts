import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Authentication removed - admin access is open
import { advancedRateLimit } from '../lib/advancedRateLimit';

export async function adminMiddleware(request: NextRequest) {
  // Apply advanced rate limiting
  const rateLimitResponse = await advancedRateLimit(request);
  if (rateLimitResponse.status === 429 || rateLimitResponse.status === 403) {
    return rateLimitResponse;
  }
  
  // Only apply to /admin routes
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Admin access is open - no authentication required
  const isValidAdmin = true; // Authentication disabled
  if (!isValidAdmin) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  const response = NextResponse.next();

  // Add security headers for admin routes
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  return response;
}

export const config = {
  matcher: '/admin/:path*'
}
