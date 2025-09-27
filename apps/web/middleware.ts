import { NextResponse, NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside

export function middleware(request: NextRequest) {
  const isAuthenticated = !!request.cookies.has('buzz8n_auth')

  console.log(request.nextUrl.pathname)

  if (request.nextUrl.pathname === '/signin' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }
}

export const config = {
  matcher: ['/signin', '/dashboard', '/workflow/:path*'],
}
