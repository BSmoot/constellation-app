// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Make sure there's no 'export async' here, just 'async'
async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session and trying to access protected route
  if (!session && req.nextUrl.pathname.startsWith('/test-db')) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/auth/sign-in'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// Add this default export
export default middleware;

export const config = {
  matcher: ['/test-db/:path*']
}