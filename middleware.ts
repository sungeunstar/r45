import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for login page
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Check if session cookie exists
  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('joyful_admin_session');

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/sessions/:path*',
    '/admin/members/:path*',
    '/admin/admins/:path*',
  ],
};
