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
      telegram_configured: !!(BOT_TOKEN && CHAT_ID),
      bot_token_exists: !!BOT_TOKEN,
      bot_token_length: BOT_TOKEN ? BOT_TOKEN.length : 0,
      bot_token_format_valid: BOT_TOKEN ? /^\d+:[A-Za-z0-9_-]+$/.test(BOT_TOKEN) : false,
      chat_id_exists: !!CHAT_ID,
      chat_id_value: CHAT_ID || 'NOT SET',
      chat_id_is_negative: CHAT_ID ? CHAT_ID.startsWith('-') : false,
      node_env: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      environment_check: {
        all_vars_set: !!(BOT_TOKEN && CHAT_ID),
        recommendations: []
      }
    });
  } catch (error) {
    console.error('Error debugging Telegram configuration:', error);
    return NextResponse.json(
      { error: 'Failed to debug Telegram configuration' },
      { status: 500 }
    );
  }
}

