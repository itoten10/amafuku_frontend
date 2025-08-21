import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

// 簡易的な管理者チェック（本番環境では改善が必要）
const ADMIN_EMAILS = [
  'masato.ito.w7@gmail.com',
  'masatest0819@gmail.com'
]

export async function GET(req: NextRequest) {
  try {
    // 認証チェック
    const session = await auth()
    
    // 管理者権限チェック（メールアドレスで判定）
    const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email)
    
    // パラメータで簡易認証も可能にする（開発用）
    const url = new URL(req.url)
    const adminKey = url.searchParams.get('key')
    const isKeyValid = adminKey === 'admin-driving-study-2025'
    
    if (!isAdmin && !isKeyValid) {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      )
    }

    // データベースから全ユーザー情報を取得
    const users = await prisma?.$queryRaw`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.quizPoints,
        u.createdAt,
        u.updatedAt,
        u.emailVerified,
        u.image,
        GROUP_CONCAT(DISTINCT a.provider) as providers,
        COUNT(DISTINCT s.id) as sessionCount,
        MAX(s.expires) as lastSessionExpires
      FROM User u
      LEFT JOIN Account a ON u.id = a.userId
      LEFT JOIN Session s ON u.id = s.userId
      GROUP BY u.id, u.name, u.email, u.quizPoints, u.createdAt, u.updatedAt, u.emailVerified, u.image
      ORDER BY u.quizPoints DESC
    ` as any[]

    // 統計情報を計算
    const stats = {
      totalUsers: users?.length || 0,
      totalPoints: users?.reduce((sum: number, user: any) => sum + (Number(user.quizPoints) || 0), 0) || 0,
      averagePoints: users?.length ? 
        Math.round((users.reduce((sum: number, user: any) => sum + (Number(user.quizPoints) || 0), 0) / users.length)) : 0,
      googleUsers: users?.filter((u: any) => u.providers?.includes('google')).length || 0,
      emailUsers: users?.filter((u: any) => !u.providers?.includes('google')).length || 0,
      activeToday: users?.filter((u: any) => {
        if (!u.lastSessionExpires) return false
        const expires = new Date(u.lastSessionExpires)
        const now = new Date()
        return expires > now
      }).length || 0
    }

    // ランキング情報を追加
    const ranking = users?.map((user: any, index: number) => ({
      rank: index + 1,
      name: user.name || 'Unknown',
      email: user.email,
      points: Number(user.quizPoints) || 0,
      provider: user.providers?.split(',')[0] || 'credentials',
      registeredAt: user.createdAt,
      lastActive: user.updatedAt
    }))

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      requestedBy: session?.user?.email || 'API Key',
      stats,
      ranking,
      users: users?.map((user: any) => ({
        ...user,
        quizPoints: Number(user.quizPoints) || 0,
        hasPassword: false, // パスワード情報は隠す
        loginMethod: user.providers || 'email/password'
      }))
    })

  } catch (error) {
    console.error('Admin API error:', error)
    return NextResponse.json(
      { 
        error: 'データの取得に失敗しました',
        details: (error as Error).message 
      },
      { status: 500 }
    )
  }
}