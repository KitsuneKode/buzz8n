import { NextResponse, NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside

export async function middleware(request: NextRequest) {
  const isAuthenticated = !!request.cookies.get('buzz8n_auth')?.value

  const pathName = request.nextUrl.pathname

  if (!isAuthenticated && pathName !== '/signin') {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  if (pathName === '/signin' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/signin', '/dashboard', '/workflow/:path*'],
}
