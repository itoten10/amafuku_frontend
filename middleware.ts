import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 認証不要のパス
  const publicPaths = [
    '/auth/signin',
    '/auth/signup', 
    '/auth/error',
    '/api/auth'
  ]
  
  // 現在のパスが認証不要のパスかチェック
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  
  // 認証不要のパスの場合はそのまま通す
  if (isPublicPath) {
    return NextResponse.next()
  }
  
  // セッションチェックは各ページでauth()を使用して行う
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}