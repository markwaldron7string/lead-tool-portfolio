import { NextResponse } from 'next/server';

export async function proxy(request) {
  return NextResponse.next();
}

export const config = {
  // Run on every path; the function body handles per-path exclusions
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
