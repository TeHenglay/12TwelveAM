import { NextRequest, NextResponse } from 'next/server';
// Authentication removed - admin access is open

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated as admin
    // const isAdmin = true; // Admin access is open
    // Authentication removed

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    return NextResponse.json({
      telegram_bot_token_exists: !!BOT_TOKEN,
      telegram_chat_id_exists: !!CHAT_ID,
      bot_token_length: BOT_TOKEN ? BOT_TOKEN.length : 0,
      chat_id_value: CHAT_ID ? CHAT_ID : 'NOT SET',
      environment_check: !!(BOT_TOKEN && CHAT_ID),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking Telegram environment:', error);
    return NextResponse.json(
      { error: 'Failed to check environment' },
      { status: 500 }
    );
  }
}

