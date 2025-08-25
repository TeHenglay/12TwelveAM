import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define paths that should be handled by middleware
const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore if the request is for static files
  if (
    pathname.startsWith('/_next') || // Next.js assets
    pathname.startsWith('/api') || // API routes
    pathname.startsWith('/static') || // Static files
    PUBLIC_FILE.test(pathname) // Public files
  ) {
    return NextResponse.next();
  }

  // Your custom middleware logic here
  // For now, just continue to the next middleware
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}