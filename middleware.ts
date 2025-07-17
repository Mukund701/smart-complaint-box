import { NextResponse, type NextRequest } from 'next/server';
import * as jose from 'jose';

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('admin_session')?.value;
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    console.error('Session secret is not set.');
    // On configuration error, redirect to homepage
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!sessionToken) {
    // If no token, redirect to homepage
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    const secretKey = new TextEncoder().encode(secret);
    await jose.jwtVerify(sessionToken, secretKey);
    // If verification is successful, allow the request to proceed
    return NextResponse.next();
  } catch (error) {
    // If verification fails, redirect to homepage
    const response = NextResponse.redirect(new URL('/', request.url));
    // Clear the invalid cookie
    response.cookies.delete('admin_session');
    return response;
  }
}

export const config = {
  matcher: '/admin/dashboard',
};