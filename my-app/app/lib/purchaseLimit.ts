import { redis } from './redis';
import { NextRequest } from 'next/server';

// Purchase limiting configuration
const PURCHASE_LIMIT_PER_IP = 2;
const PURCHASE_TIMEOUT_MINUTES = 30; // 30 minutes timeout
const PURCHASE_TIMEOUT_SECONDS = PURCHASE_TIMEOUT_MINUTES * 60;

// Get client IP address
export function getClientIP(request: NextRequest): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = request.headers.get('x-client-ip');
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) return realIP;
  if (clientIP) return clientIP;
  
  // Fallback if no IP found
  return 'unknown';
}

// Check if IP can make a purchase
export async function canPurchase(ip: string): Promise<{
  allowed: boolean;
  currentPurchases: number;
  limit: number;
  timeoutRemaining?: number;
}> {
  try {
    const key = `purchase_limit:${ip}`;
    const purchases = await redis.get(key);
    const currentPurchases = purchases ? parseInt(purchases as string) : 0;
    
    if (currentPurchases >= PURCHASE_LIMIT_PER_IP) {
      // Get TTL to see how much time is left
      const ttl = await redis.ttl(key);
      return {
        allowed: false,
        currentPurchases,
        limit: PURCHASE_LIMIT_PER_IP,
        timeoutRemaining: ttl > 0 ? ttl : 0,
      };
    }
    
    return {
      allowed: true,
      currentPurchases,
      limit: PURCHASE_LIMIT_PER_IP,
    };
  } catch (error) {
    console.error('Error checking purchase limit:', error);
    // If Redis is down, allow purchase (fail open)
    return {
      allowed: true,
      currentPurchases: 0,
      limit: PURCHASE_LIMIT_PER_IP,
    };
  }
}

// Record a purchase for an IP
export async function recordPurchase(ip: string): Promise<void> {
  try {
    const key = `purchase_limit:${ip}`;
    const current = await redis.get(key);
    const currentPurchases = current ? parseInt(current as string) : 0;
    
    if (currentPurchases === 0) {
      // First purchase, set with expiry
      await redis.set(key, 1, { ex: PURCHASE_TIMEOUT_SECONDS });
    } else {
      // Increment existing counter (TTL is preserved)
      await redis.incr(key);
    }
  } catch (error) {
    console.error('Error recording purchase:', error);
    // Don't throw error, as this shouldn't block the purchase
  }
}

// Get formatted time remaining
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return '0 minutes';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
}

// Check purchase limit from NextRequest
export async function checkPurchaseLimit(request: NextRequest) {
  const ip = getClientIP(request);
  return await canPurchase(ip);
}
