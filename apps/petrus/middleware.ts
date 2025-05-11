import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const theme = request.cookies.get('theme')?.value || 'light'
  const response = NextResponse.next()
  response.headers.set('Set-Cookie', `theme=${theme}; path=/`)
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
