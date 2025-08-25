import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Create a new ratelimiter that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

export async function rateLimit(request: NextRequest) {
  // Get IP address from request
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             '127.0.0.1';

  // Rate limit by IP
  const { success, pending, limit, reset, remaining } = await ratelimit.limit(
    `ratelimit_${ip}`
  );

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    );
  }

  const response = NextResponse.next();

  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', reset.toString());

  return response;
}
