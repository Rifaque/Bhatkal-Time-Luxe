import { NextResponse } from 'next/server';

export function middleware(req) {
  const token = req.cookies.get('adminToken')?.value;
  const { pathname } = req.nextUrl;

  // Gated Admin routes (excluding login page itself)
  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';
  
  if (isAdminRoute && !token) {
    // Redirect unauthorized admin requests to login page
    const loginUrl = new URL('/admin/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in and visiting login, redirect to dashboard
  if (pathname === '/admin/login' && token) {
    const dashboardUrl = new URL('/admin/dashboard', req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
