import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is missing.");
}
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  const isAuthPage = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/signup');
  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard');
  const isProtectedApi = req.nextUrl.pathname.startsWith('/api') && !req.nextUrl.pathname.startsWith('/api/auth');

  if (!token && isDashboard) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  if (!token && isProtectedApi) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      if (isAuthPage) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    } catch (err) {
      if (isDashboard) {
        const response = NextResponse.redirect(new URL('/login', req.url));
        response.cookies.delete('token');
        return response;
      }
      if (isProtectedApi) {
        const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        response.cookies.delete('token');
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/room/:path*', '/api/:path*', '/login', '/signup'],
};
