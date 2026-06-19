import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || '';

function decodeBase64Url(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function verifyAdminJWT(token) {
  if (!token || !JWT_SECRET) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const [headerB64, payloadB64, sigB64] = parts;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      decodeBase64Url(sigB64),
      new TextEncoder().encode(`${headerB64}.${payloadB64}`)
    );
    if (!valid) return false;

    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(payloadB64)));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return false;

    return true;
  } catch {
    return false;
  }
}

export async function proxy(req) {
  const token = req.cookies.get('adminToken')?.value;
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';

  if (isAdminRoute) {
    if (!token || !(await verifyAdminJWT(token))) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  if (pathname === '/admin/login' && token && (await verifyAdminJWT(token))) {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
