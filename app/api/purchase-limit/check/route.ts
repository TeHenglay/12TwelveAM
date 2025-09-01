import { NextRequest, NextResponse } from 'next/server';
import { checkPurchaseLimit, formatTimeRemaining } from '@/app/lib/purchaseLimit';

export async function GET(request: NextRequest) {
  try {
    const limitInfo = await checkPurchaseLimit(request);
    
    return NextResponse.json({
      allowed: limitInfo.allowed,
      currentPurchases: limitInfo.currentPurchases,
      limit: limitInfo.limit,
      timeoutRemaining: limitInfo.timeoutRemaining,
      timeoutFormatted: limitInfo.timeoutRemaining 
        ? formatTimeRemaining(limitInfo.timeoutRemaining)
        : null,
    });
  } catch (error) {
    console.error('Error checking purchase limit:', error);
    return NextResponse.json(
      { error: 'Failed to check purchase limit' },
      { status: 500 }
    );
  }
}
