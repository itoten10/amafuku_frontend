import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL || 
    `https://${request.headers.get('host')}`
  
  const callbackUrl = `${baseUrl}/api/auth/callback/google`
  
  const debugInfo = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    host: request.headers.get('host'),
    baseUrl,
    expectedCallbackUrl: callbackUrl,
    actualRequestUrl: request.url,
    headers: {
      'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
      'x-forwarded-host': request.headers.get('x-forwarded-host'),
    }
  }
  
  console.log('🔍 OAuth Debug Info:', debugInfo)
  
  return NextResponse.json(debugInfo)
}