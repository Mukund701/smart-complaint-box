import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // Clear the session cookie by setting its expiration date to the past
  cookies().set('admin_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0), 
    path: '/',
  });

  return NextResponse.json({ message: 'Logout successful' }, { status: 200 });
}