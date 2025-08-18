import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // サーバーサイドで環境変数を取得
    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    console.log('🔧 API Route /api/config called')
    console.log('🗺️ Google Maps API Key exists:', !!googleMapsApiKey)
    console.log('🗺️ API Key preview:', googleMapsApiKey ? `${googleMapsApiKey.substring(0, 10)}...` : 'undefined')
    
    if (!googleMapsApiKey) {
      console.error('❌ Google Maps API key not found in environment variables')
      return NextResponse.json(
        { error: 'Google Maps API key not configured' }, 
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      googleMapsApiKey,
      status: 'success'
    })
  } catch (error) {
    console.error('❌ Config API error:', error)
    return NextResponse.json(
      { error: 'Configuration fetch failed' }, 
      { status: 500 }
    )
  }
}