import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

declare global {
  var prisma: PrismaClient | undefined
}

// SSL証明書のパスを設定
const sslCertPath = process.env.NODE_ENV === 'production' 
  ? '/home/site/wwwroot/DigiCertGlobalRootCA.crt.pem'
  : path.join(process.cwd(), 'DigiCertGlobalRootCA.crt.pem')

// DATABASE_URLを修正してSSL設定を適用
function getDatabaseUrl() {
  const baseUrl = process.env.DATABASE_URL
  if (!baseUrl) {
    console.error('❌ DATABASE_URL is not set')
    return undefined
  }

  // Azure MySQLの場合、SSL証明書を使用
  if (baseUrl.includes('mysql.database.azure.com')) {
    // URLを解析
    const url = new URL(baseUrl)
    
    // SSL証明書が存在するか確認
    if (fs.existsSync(sslCertPath)) {
      console.log('✅ SSL certificate found at:', sslCertPath)
      // Prisma用のSSLパラメータを設定
      url.searchParams.set('sslmode', 'require')
      url.searchParams.set('sslcert', sslCertPath)
      
      const modifiedUrl = url.toString()
      console.log('🔐 Database URL configured with SSL')
      return modifiedUrl
    } else {
      console.warn('⚠️ SSL certificate not found at:', sslCertPath)
      // SSL証明書がない場合はsslacceptを使用
      url.searchParams.set('sslmode', 'require')
      url.searchParams.set('sslaccept', 'strict')
      return url.toString()
    }
  }
  
  return baseUrl
}

// Prismaクライアントの初期化
function createPrismaClient() {
  const databaseUrl = getDatabaseUrl()
  
  if (!databaseUrl) {
    console.error('❌ Cannot create Prisma client without DATABASE_URL')
    return null
  }

  try {
    // 環境変数を一時的に上書き
    const originalUrl = process.env.DATABASE_URL
    process.env.DATABASE_URL = databaseUrl
    
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'error', 'warn'] 
        : ['error'],
      datasources: {
        db: {
          url: databaseUrl
        }
      }
    })
    
    // 元の環境変数を復元
    if (originalUrl) {
      process.env.DATABASE_URL = originalUrl
    }
    
    return client
  } catch (error) {
    console.error('❌ Failed to create Prisma client:', error)
    return null
  }
}

// シングルトンパターンでPrismaクライアントを管理
const prisma = global.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production' && prisma) {
  global.prisma = prisma
}

export default prisma