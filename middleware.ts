import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const auth = req.cookies.get('auth')?.value
  const { pathname } = req.nextUrl

  // ✅ 放行：Next.js 靜態資源
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next()
  }

  // ✅ 放行：登入頁
  if (pathname === '/login') {
    return NextResponse.next()
  }

  // ✅ 已登入
  if (auth === 'ok') {
    return NextResponse.next()
  }

  // ❌ 其他導去登入
  return NextResponse.redirect(new URL('/login', req.url))
}
