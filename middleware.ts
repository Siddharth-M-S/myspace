import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isPublicPath =
    nextUrl.pathname.startsWith('/login') ||
    nextUrl.pathname.startsWith('/shared/') ||
    nextUrl.pathname.startsWith('/api/auth') ||
    nextUrl.pathname.startsWith('/api/share') ||
    nextUrl.pathname.startsWith('/api/setup')

  if (!isLoggedIn && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  if (isLoggedIn && nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
