import { NextResponse } from 'next/server';

export async function POST() {
  // Clear the session cookie by setting it to a past date
  const response = NextResponse.json({ message: 'Logout successful' });
  response.cookies.set('session-token', '', {
    httpOnly: true,
    path: '/',
    expires: new Date(0), // This sets the cookie to expire immediately
    secure: process.env.NODE_ENV === 'production', // Ensure it's secure in production
    sameSite: 'strict',
  });

  return response;
}