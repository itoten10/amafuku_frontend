import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const result = {
    timestamp: new Date().toISOString(),
    status: 'initializing',
    steps: [] as any[],
    error: null as string | null
  }

  try {
    // Step 1: Check connection
    result.steps.push({ step: 'Check connection', status: 'checking' })
    if (!prisma) {
      throw new Error('Prisma client is not initialized')
    }
    result.steps[0].status = 'success'

    // Step 2: Create tables using raw SQL
    result.steps.push({ step: 'Create User table', status: 'running' })
    
    try {
      // Userテーブルを作成
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS User (
          id VARCHAR(191) NOT NULL,
          name VARCHAR(191),
          email VARCHAR(191) NOT NULL,
          emailVerified DATETIME(3),
          image VARCHAR(191),
          password VARCHAR(191),
          quizPoints INT NOT NULL DEFAULT 0,
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          PRIMARY KEY (id),
          UNIQUE KEY User_email_key (email)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `
      result.steps[1].status = 'success'
    } catch (e) {
      result.steps[1].status = 'skipped'
      result.steps[1].message = 'Table may already exist'
    }

    // Step 3: Create Account table
    result.steps.push({ step: 'Create Account table', status: 'running' })
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS Account (
          id VARCHAR(191) NOT NULL,
          userId VARCHAR(191) NOT NULL,
          type VARCHAR(191) NOT NULL,
          provider VARCHAR(191) NOT NULL,
          providerAccountId VARCHAR(191) NOT NULL,
          refresh_token TEXT,
          access_token TEXT,
          expires_at INT,
          token_type VARCHAR(191),
          scope VARCHAR(191),
          id_token TEXT,
          session_state VARCHAR(191),
          PRIMARY KEY (id),
          INDEX Account_userId_idx (userId),
          UNIQUE KEY Account_provider_providerAccountId_key (provider, providerAccountId)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `
      result.steps[2].status = 'success'
    } catch (e) {
      result.steps[2].status = 'skipped'
      result.steps[2].message = 'Table may already exist'
    }

    // Step 4: Create Session table
    result.steps.push({ step: 'Create Session table', status: 'running' })
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS Session (
          id VARCHAR(191) NOT NULL,
          sessionToken VARCHAR(191) NOT NULL,
          userId VARCHAR(191) NOT NULL,
          expires DATETIME(3) NOT NULL,
          PRIMARY KEY (id),
          UNIQUE KEY Session_sessionToken_key (sessionToken),
          INDEX Session_userId_idx (userId)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `
      result.steps[3].status = 'success'
    } catch (e) {
      result.steps[3].status = 'skipped'
      result.steps[3].message = 'Table may already exist'
    }

    // Step 5: Create VerificationToken table
    result.steps.push({ step: 'Create VerificationToken table', status: 'running' })
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS VerificationToken (
          identifier VARCHAR(191) NOT NULL,
          token VARCHAR(191) NOT NULL,
          expires DATETIME(3) NOT NULL,
          UNIQUE KEY VerificationToken_token_key (token),
          UNIQUE KEY VerificationToken_identifier_token_key (identifier, token)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `
      result.steps[4].status = 'success'
    } catch (e) {
      result.steps[4].status = 'skipped'
      result.steps[4].message = 'Table may already exist'
    }

    // Step 6: Verify tables
    result.steps.push({ step: 'Verify tables', status: 'running' })
    const userCount = await prisma.user.count()
    const accountCount = await prisma.account.count()
    const sessionCount = await prisma.session.count()
    
    result.steps[5].status = 'success'
    result.steps[5].counts = {
      users: userCount,
      accounts: accountCount,
      sessions: sessionCount
    }

    result.status = 'success'
    return NextResponse.json(result)

  } catch (error) {
    result.status = 'error'
    result.error = (error as Error).message
    console.error('Database initialization error:', error)
    return NextResponse.json(result, { status: 500 })
  }
}