import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
    sslCertExists: false,
    prismaClient: !!prisma,
    connectionTest: null,
    error: null
  }

  // SSL証明書の存在確認
  try {
    const fs = require('fs')
    const certPath = '/home/site/wwwroot/DigiCertGlobalRootCA.crt.pem'
    debugInfo.sslCertExists = fs.existsSync(certPath)
    debugInfo.sslCertPath = certPath
  } catch (e) {
    debugInfo.sslCertCheckError = (e as Error).message
  }

  // データベース接続テスト
  if (prisma) {
    try {
      // 簡単なクエリでデータベース接続をテスト
      const userCount = await prisma.user.count()
      debugInfo.connectionTest = 'Success'
      debugInfo.userCount = userCount
      debugInfo.message = 'Database connection successful!'
    } catch (error) {
      debugInfo.connectionTest = 'Failed'
      debugInfo.error = (error as Error).message
      console.error('Database connection error:', error)
    }
  } else {
    debugInfo.connectionTest = 'Failed'
    debugInfo.error = 'Prisma client is not initialized'
  }

  // DATABASE_URLの形式確認（機密情報は隠す）
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL)
      debugInfo.databaseHost = url.hostname
      debugInfo.databaseName = url.pathname.slice(1).split('?')[0]
      debugInfo.sslParams = Object.fromEntries(url.searchParams)
    } catch (e) {
      debugInfo.urlParseError = (e as Error).message
    }
  }

  return NextResponse.json(debugInfo, { 
    status: debugInfo.connectionTest === 'Success' ? 200 : 500 
  })
}