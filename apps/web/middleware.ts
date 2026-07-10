import { NextResponse, NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isAuthenticated = !!request.cookies.get('buzz8n_auth')?.value
  const pathName = request.nextUrl.pathname
  const isAuthPage = pathName === '/signin' || pathName === '/signup'

  if (!isAuthenticated && !isAuthPage) {
    const signInUrl = new URL('/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', pathName)
    return NextResponse.redirect(signInUrl)
  }

  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/signin', '/signup', '/dashboard', '/workflow/:path*'],
}
