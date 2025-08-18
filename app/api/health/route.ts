import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'missing',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'configured' : 'missing',
    },
    routes: {
      auth: {
        signin: '/api/auth/signin',
        callback: '/api/auth/callback/credentials',
        session: '/api/auth/session',
      }
    }
  })
}