import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  
  // 認証不要のパス（ログインページ、サインアップページ、API、静的ファイル）
  const publicPaths = [
    '/auth/signin',
    '/auth/signup', 
    '/auth/error',
    '/api/auth'
  ]
  
  // 現在のパスが認証不要のパスかチェック
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  
  // ログインしていない場合
  if (!isLoggedIn && !isPublicPath) {
    // ログインページにリダイレクト
    const loginUrl = new URL('/auth/signin', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // ログイン済みでログインページにアクセスした場合はホームにリダイレクト
  if (isLoggedIn && pathname === '/auth/signin') {
    return NextResponse.redirect(new URL('/', req.url))
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}