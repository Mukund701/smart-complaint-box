import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const secret = process.env.SESSION_SECRET;

    if (!adminUsername || !adminPassword || !secret) {
      console.error('Admin credentials or session secret not set in .env.local');
      return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
    }

    if (username === adminUsername && password === adminPassword) {
      // Create the session JWT
      const secretKey = new TextEncoder().encode(secret);
      const token = await new jose.SignJWT({ username: adminUsername, isLoggedIn: true })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(secretKey);

      // Set the cookie
      cookies().set('admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });

      return NextResponse.json({ message: 'Login successful!' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Invalid username or password.' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}