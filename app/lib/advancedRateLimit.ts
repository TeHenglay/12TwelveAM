import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define rate limit configurations for different routes
export type RateLimitConfig = {
  limit: number;
  window: `${number} ${'s' | 'm' | 'h' | 'd'}`; // Duration format for Upstash
  blockDuration?: string; // Duration to block after exceeding limit
};

// Rate limit configurations for different route types
export const rateLimitConfigs: Record<string, RateLimitConfig> = {
  default: {
    limit: 10,
    window: '10 s',
  },
  api: {
    limit: 30,
    window: '60 s',
  },
  auth: {
    limit: 5,
    window: '60 s',
    blockDuration: '10 m', // Block for 10 minutes after 5 failed attempts
  },
  admin: {
    limit: 20,
    window: '60 s',
  },
  checkout: {
    limit: 5,
    window: '60 s',
  },
};

// Create rate limiters for each configuration
const rateLimiters: Record<string, Ratelimit> = {};

// Initialize rate limiters
Object.entries(rateLimitConfigs).forEach(([key, config]) => {
  rateLimiters[key] = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.limit, config.window),
    analytics: true,
  });
});

// Get the appropriate rate limiter based on the request path
function getRateLimiterType(path: string): string {
  if (path.startsWith('/api')) return 'api';
  if (path.startsWith('/admin')) return 'admin';
  if (path.includes('/login') || path.includes('/register')) return 'auth';
  if (path.startsWith('/checkout')) return 'checkout';
  return 'default';
}

// Get IP address from request with fallbacks
export function getIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  
  if (forwardedFor) {
    // Get the first IP if there are multiple
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP;
  
  // Fallback to a placeholder for localhost
  return '127.0.0.1';
}

// Check if IP is in blocklist
export async function isIPBlocked(ip: string): Promise<boolean> {
  const blocked = await redis.get<string>(`blocked:${ip}`);
  return !!blocked;
}

// Block an IP for a specified duration
export async function blockIP(ip: string, duration: string = '1h'): Promise<void> {
  // Convert duration string to seconds
  const durationInSeconds = parseDuration(duration);
  await redis.set(`blocked:${ip}`, 'blocked', { ex: durationInSeconds });
}

// Parse duration string to seconds
function parseDuration(duration: string): number {
  const value = parseInt(duration.split(' ')[0]);
  const unit = duration.split(' ')[1];
  
  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 60 * 60 * 24;
    default:
      return 3600; // Default to 1 hour
  }
}

// Advanced rate limiting middleware
export async function advancedRateLimit(request: NextRequest) {
  // Get client IP
  const ip = getIP(request);
  
  // Check if IP is blocked
  if (await isIPBlocked(ip)) {
    return NextResponse.json(
      { error: 'IP address temporarily blocked due to suspicious activity' },
      { status: 403 }
    );
  }
  
  // Determine which rate limiter to use based on the request path
  const path = request.nextUrl.pathname;
  const limiterType = getRateLimiterType(path);
  const limiter = rateLimiters[limiterType];
  const config = rateLimitConfigs[limiterType];
  
  // Create a unique identifier based on IP and path pattern
  const identifier = `ratelimit:${limiterType}:${ip}`;
  
  // Apply rate limiting
  const { success, pending, limit, reset, remaining } = await limiter.limit(identifier);
  
  if (!success) {
    // If auth route and limit exceeded, consider blocking the IP
    if (limiterType === 'auth' && config.blockDuration) {
      // Check how many consecutive failures
      const failCount = await redis.incr(`failcount:${ip}`);
      
      // If more than 10 consecutive failures, block the IP
      if (failCount > 10) {
        await blockIP(ip, config.blockDuration);
        await redis.del(`failcount:${ip}`); // Reset fail count
        
        return NextResponse.json(
          { error: 'Too many failed attempts. Your IP has been temporarily blocked.' },
          { status: 403 }
        );
      }
      
      // Set expiry on fail count (reset after 30 minutes of no failures)
      await redis.expire(`failcount:${ip}`, 30 * 60);
    }
    
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
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
  
  // If this is a successful request on an auth route, reset the fail count
  if (limiterType === 'auth') {
    await redis.del(`failcount:${ip}`);
  }
  
  const response = NextResponse.next();
  
  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', reset.toString());
  
  return response;
}
