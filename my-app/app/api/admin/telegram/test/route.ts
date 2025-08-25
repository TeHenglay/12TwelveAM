import { NextRequest, NextResponse } from 'next/server';
// Authentication removed - admin access is open
import { sendTestMessage } from '@/app/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated as admin
    // const isAdmin = true; // Admin access is open
    // Authentication removed

    const success = await sendTestMessage();
    
    if (success) {
      return NextResponse.json({ 
        message: 'Test message sent successfully to Telegram!' 
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send test message. Please check your Telegram configuration.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error testing Telegram bot:', error);
    return NextResponse.json(
      { error: 'Failed to test Telegram bot' },
      { status: 500 }
    );
  }
}

