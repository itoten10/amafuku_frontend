import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

// ポイントを取得
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ points: 0 })
    }

    const user = await prisma?.user.findUnique({
      where: { email: session.user.email },
      select: { quizPoints: true }
    })

    return NextResponse.json({ 
      points: user?.quizPoints || 0 
    })
  } catch (error) {
    console.error('Error fetching points:', error)
    return NextResponse.json({ points: 0 })
  }
}

// ポイントを更新
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      )
    }

    const { points } = await req.json()
    
    if (typeof points !== 'number' || points < 0) {
      return NextResponse.json(
        { error: '無効なポイント数です' },
        { status: 400 }
      )
    }

    const updatedUser = await prisma?.user.update({
      where: { email: session.user.email },
      data: { 
        quizPoints: points,
        updatedAt: new Date()
      },
      select: { 
        quizPoints: true,
        name: true,
        email: true
      }
    })

    return NextResponse.json({ 
      success: true,
      points: updatedUser?.quizPoints || points,
      user: updatedUser
    })
  } catch (error) {
    console.error('Error updating points:', error)
    return NextResponse.json(
      { error: 'ポイントの更新に失敗しました' },
      { status: 500 }
    )
  }
}

// ポイントを加算（増分更新）
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      )
    }

    const { pointsToAdd } = await req.json()
    
    if (typeof pointsToAdd !== 'number' || pointsToAdd < 0) {
      return NextResponse.json(
        { error: '無効なポイント数です' },
        { status: 400 }
      )
    }

    // 現在のポイントを取得
    const currentUser = await prisma?.user.findUnique({
      where: { email: session.user.email },
      select: { quizPoints: true }
    })

    const newPoints = (currentUser?.quizPoints || 0) + pointsToAdd

    // ポイントを更新
    const updatedUser = await prisma?.user.update({
      where: { email: session.user.email },
      data: { 
        quizPoints: newPoints,
        updatedAt: new Date()
      },
      select: { 
        quizPoints: true,
        name: true,
        email: true
      }
    })

    return NextResponse.json({ 
      success: true,
      points: updatedUser?.quizPoints || newPoints,
      pointsAdded: pointsToAdd,
      user: updatedUser
    })
  } catch (error) {
    console.error('Error adding points:', error)
    return NextResponse.json(
      { error: 'ポイントの追加に失敗しました' },
      { status: 500 }
    )
  }
}