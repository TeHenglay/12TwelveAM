import { NextRequest, NextResponse } from 'next/server';
// Authentication removed - admin access is open
import { invalidateCache, invalidateAllCache, CACHE_KEYS } from '@/app/lib/redis';

export async function POST(request: NextRequest) {
  try {
    // const isAdmin = true; // Admin access is open
    // Authentication removed

    const { key } = await request.json();
    
    if (key === 'all') {
      await invalidateAllCache();
      return NextResponse.json({ 
        success: true, 
        message: 'All cache invalidated successfully' 
      });
    } else if (key) {
      await invalidateCache(key);
      return NextResponse.json({ 
        success: true, 
        message: `Cache for key "${key}" invalidated successfully` 
      });
    } else {
      return NextResponse.json({ 
        error: 'No cache key specified' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error invalidating cache:', error);
    return NextResponse.json({ 
      error: 'Failed to invalidate cache' 
    }, { status: 500 });
  }
}

