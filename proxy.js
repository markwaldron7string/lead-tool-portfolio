import { NextResponse } from 'next/server';

// Portfolio deployment: public demo with no password gate.
export async function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
