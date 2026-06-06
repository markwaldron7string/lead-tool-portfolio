import { NextResponse } from 'next/server';

const COOKIE_NAME = 'lead_scraper_auth';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { password } = body;
  const sitePassword = process.env.SITE_PASSWORD;

  if (!sitePassword) {
    console.error('SITE_PASSWORD env var is not set');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  if (!password || password !== sitePassword) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  const hash = await hashPassword(sitePassword);

  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, hash, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });

  return response;
}
