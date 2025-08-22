import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    prismaClient: !!prisma,
    error: null,
    details: []
  }

  try {
    // Step 1: Prismaクライアントの確認
    debugInfo.details.push({ step: 'Prisma client check', status: !!prisma ? 'success' : 'failed' })
    
    if (!prisma) {
      debugInfo.error = 'Prisma client is not initialized'
      return NextResponse.json(debugInfo, { status: 500 })
    }

    // Step 2: シンプルなクエリテスト
    debugInfo.details.push({ step: 'Simple query test', status: 'running' })
    
    try {
      const userCount = await prisma.user.count()
      debugInfo.details[1].status = 'success'
      debugInfo.details[1].result = `Found ${userCount} users`
      debugInfo.userCount = userCount
    } catch (error) {
      debugInfo.details[1].status = 'failed'
      debugInfo.details[1].error = (error as Error).message
      throw error
    }

    // Step 3: Raw SQLクエリテスト
    debugInfo.details.push({ step: 'Raw SQL query test', status: 'running' })
    
    try {
      const users = await prisma.$queryRaw`
        SELECT 
          id,
          name,
          email,
          quizPoints
        FROM User 
        LIMIT 3
      ` as any[]
      
      debugInfo.details[2].status = 'success'
      debugInfo.details[2].result = `Retrieved ${users.length} users`
      debugInfo.sampleUsers = users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        points: Number(u.quizPoints) || 0
      }))
    } catch (error) {
      debugInfo.details[2].status = 'failed'
      debugInfo.details[2].error = (error as Error).message
      throw error
    }

    // Step 4: 複雑なJOINクエリテスト
    debugInfo.details.push({ step: 'Complex JOIN query test', status: 'running' })
    
    try {
      const complexQuery = await prisma.$queryRaw`
        SELECT 
          u.id,
          u.name,
          u.email,
          u.quizPoints,
          GROUP_CONCAT(DISTINCT a.provider) as providers
        FROM User u
        LEFT JOIN Account a ON u.id = a.userId
        GROUP BY u.id, u.name, u.email, u.quizPoints
        LIMIT 3
      ` as any[]
      
      debugInfo.details[3].status = 'success'
      debugInfo.details[3].result = `Complex query returned ${complexQuery.length} results`
      debugInfo.complexQueryResult = complexQuery
    } catch (error) {
      debugInfo.details[3].status = 'failed'  
      debugInfo.details[3].error = (error as Error).message
      debugInfo.error = `Complex query failed: ${(error as Error).message}`
    }

    return NextResponse.json(debugInfo)

  } catch (error) {
    debugInfo.error = (error as Error).message
    debugInfo.stackTrace = (error as Error).stack
    console.error('Admin debug error:', error)
    return NextResponse.json(debugInfo, { status: 500 })
  }
}