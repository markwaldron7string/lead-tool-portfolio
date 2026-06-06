import { NextResponse } from 'next/server';

const COOKIE_NAME = 'lead_scraper_auth';

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function proxy(request) {
  // Demo mode: skip all auth checks entirely
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Never protect these paths
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const sitePassword = process.env.SITE_PASSWORD;
  const cookie = request.cookies.get(COOKIE_NAME);

  if (sitePassword && cookie?.value) {
    const expectedHash = await hashPassword(sitePassword);
    if (cookie.value === expectedHash) {
      return NextResponse.next();
    }
  }

  // Not authenticated — redirect to /login, carry the destination
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('from', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Run on every path; the function body handles per-path exclusions
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
