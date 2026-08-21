import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const userRole = req.auth?.user?.role;

  // Edge-level route protection for /admin routes
  if (pathname.startsWith('/admin')) {
    if (userRole === 'STAFF' || !userRole) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/stats/:path*',
    '/api/system/:path*',
  ],
};
