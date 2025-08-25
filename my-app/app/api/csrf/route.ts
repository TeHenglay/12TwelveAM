import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export function GET(request: NextRequest) {
  // Generate a random token
  const csrfToken = crypto.randomBytes(32).toString('hex');
  
  // Create the response
  const response = NextResponse.json({ csrfToken });
  
  // Set the cookie in the response
  response.cookies.set({
    name: 'csrf-token',
    value: csrfToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  
  return response;
}
