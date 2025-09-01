import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const pathname = request.nextUrl.pathname;

  // Handle static files and API routes
  if (
    pathname.startsWith('/_next') || // Next.js static files
    pathname.startsWith('/api') || // API routes
    pathname.includes('.') || // Files with extensions
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // For all other requests, continue normally
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
