import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  // Authentication & session logic
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/submit/:path*'],
};
