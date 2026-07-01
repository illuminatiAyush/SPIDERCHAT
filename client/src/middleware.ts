import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// We use `jose` for edge compatibility in Next.js middleware
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super_secret_jwt_key_for_webverse');

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  const isAuthPage = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/signup');
  const isProtectedPage = req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/room');

  if (!token && isProtectedPage) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      // Valid token
      if (isAuthPage) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    } catch (err) {
      // Invalid token
      if (isProtectedPage) {
        const response = NextResponse.redirect(new URL('/login', req.url));
        response.cookies.delete('token');
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/room/:path*', '/login', '/signup'],
};
