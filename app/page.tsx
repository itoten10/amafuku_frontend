'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { EnhancedGoogleMapRoute } from '@/components/EnhancedGoogleMapRoute'
import { WorkingQuizPanel } from '@/components/WorkingQuizPanel'
import { AIQuizPanel } from '@/components/AIQuizPanel'
import { TrendingUp, Sparkles, GraduationCap, User, LogOut } from 'lucide-react'

interface RouteInfo {
  origin: string
  destination: string
  distance: string
  duration: string
  route: google.maps.DirectionsRoute | null
}

interface HistoricalSpot {
  place_id: string
  name: string
  address: string
  lat: number
  lng: number
  description: string
}

export default function Home() {
  const { data: session, status } = useSession()
  const [currentRoute, setCurrentRoute] = useState<RouteInfo | null>(null)
  const [historicalSpots, setHistoricalSpots] = useState<HistoricalSpot[]>([])
  const [selectedSpot, setSelectedSpot] = useState<HistoricalSpot | null>(null)
  const [userScore, setUserScore] = useState(0)
  const [quizMode, setQuizMode] = useState<'basic' | 'ai'>('basic')
  const [isShared, setIsShared] = useState(false)

  // 認証状態をチェック - オプショナルログイン対応
  // ログインなしでもアプリを利用可能にする

  // Google Maps APIデバッグ情報を出力
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    console.log('🗺️ Google Maps API Debug:')
    console.log('API Key exists:', !!apiKey)
    console.log('API Key preview:', apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined')
  }, [])

  // ユーザーのポイントをデータベースから読み込む
  useEffect(() => {
    if (session?.user) {
      // ログインしている場合、データベースからポイントを取得
      fetch('/api/user/points')
        .then(res => res.json())
        .then(data => {
          if (data.points !== undefined) {
            setUserScore(data.points)
            console.log('📊 Loaded user points:', data.points)
          }
        })
        .catch(err => console.error('Failed to load points:', err))
    }
  }, [session])

  // ローディング中の場合はローディング画面を表示
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  // ログインなしでもアプリを利用可能にするため、未認証でもメイン画面を表示

  const handleRouteFound = (routeInfo: RouteInfo) => {
    setCurrentRoute(routeInfo)
    setSelectedSpot(null) // ルートが変わったらクイズパネルをリセット
  }

  const handleSpotsFound = (spots: HistoricalSpot[]) => {
    setHistoricalSpots(spots)
  }

  const handleScoreUpdate = async (points: number) => {
    const newScore = userScore + points
    setUserScore(newScore)
    
    // ログインしている場合、データベースに保存
    if (session?.user) {
      try {
        const response = await fetch('/api/user/points', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ points: newScore })
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ Points saved to database:', data.points)
        } else {
          console.error('Failed to save points')
        }
      } catch (error) {
        console.error('Error saving points:', error)
      }
    }
  }

  const handleShareToNavigation = () => {
    // デモ用のナビ共有機能
    setIsShared(true)
    setTimeout(() => setIsShared(false), 3000) // 3秒後にリセット
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <img 
                src="/car_icon.png" 
                alt="Car Icon" 
                className="h-8 w-8 object-contain"
              />
              <h1 className="text-xl font-bold text-gray-900">
                Driving Study
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                あなたのスコア: <span className="font-bold text-red-600">{userScore}点</span>
              </div>
              
              {/* 認証済みユーザー情報 - セッション状態で条件分岐 */}
              {session ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{session.user?.name || 'ユーザー'}</span>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                    className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>ログアウト</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <a
                    href="/auth/signin"
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    ログイン
                  </a>
                  <a
                    href="/auth/signup"
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    新規登録
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側: ルート検索と地図 */}
          <div className="lg:col-span-2">

            {/* マップコンポーネント */}
            <EnhancedGoogleMapRoute 
              onRouteFound={handleRouteFound}
              onSpotsFound={handleSpotsFound}
            />
            
            {/* ルート情報表示 */}
            {currentRoute && (
              <div className="mt-4 bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">ルート情報</h3>
                  <button
                    onClick={handleShareToNavigation}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    📱 ナビに共有
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">出発:</span> {currentRoute.origin}
                  </div>
                  <div>
                    <span className="text-gray-600">到着:</span> {currentRoute.destination}
                  </div>
                  <div>
                    <span className="text-gray-600">距離:</span> {currentRoute.distance}
                  </div>
                  <div>
                    <span className="text-gray-600">時間:</span> {currentRoute.duration}
                  </div>
                </div>
                
                {/* 共有完了メッセージ */}
                {isShared && (
                  <div className="mt-3 p-3 bg-gray-100 border border-gray-300 rounded-lg">
                    <div className="flex items-center text-gray-700 text-sm">
                      <span className="mr-2">✅</span>
                      ナビアプリに共有しました！（デモ）
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* 右側: スコアボードと歴史スポット/クイズ */}
          <div className="space-y-6">
            {/* スコアボード */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-red-600" />
                ランキング
              </h2>
              <div className="mb-6 p-4 bg-red-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">あなたのスコア</span>
                  <span className="text-2xl font-bold text-red-600">{userScore}点</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-semibold text-yellow-500">1位</span>
                    <span className="font-medium">たろう</span>
                  </div>
                  <span className="font-semibold">580点</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-semibold text-gray-400">2位</span>
                    <span className="font-medium">はなこ</span>
                  </div>
                  <span className="font-semibold">450点</span>
                </div>
                {userScore > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-100 border border-red-300">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-semibold text-red-600">3位</span>
                      <span className="font-medium">あなた</span>
                    </div>
                    <span className="font-semibold">{userScore}点</span>
                  </div>
                )}
              </div>
            </div>

            {/* 歴史スポット一覧 */}
            {historicalSpots.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-gray-600" />
                  学びスポット ({historicalSpots.length})
                </h2>
                <div className="space-y-3">
                  {historicalSpots.map((spot) => {
                    // スポット情報の型推論を強化
                    const enhancedSpot = spot as HistoricalSpot & {
                      category?: string
                      historical_period?: string
                      significance?: string
                    }
                    
                    // カテゴリに応じたアイコンと色を設定
                    const getCategoryInfo = (category?: string) => {
                      const categoryMap: { [key: string]: { icon: string, color: string, label: string } } = {
                        'castles': { icon: '🏯', color: 'blue', label: '城郭' },
                        'temples': { icon: '🏛️', color: 'yellow', label: '寺院' },
                        'shrines': { icon: '⛩️', color: 'red', label: '神社' },
                        'battles': { icon: '⚔️', color: 'purple', label: '古戦場' },
                        'historical_figures': { icon: '👤', color: 'indigo', label: '偉人' },
                        'edo': { icon: '🏘️', color: 'green', label: '江戸遺産' },
                        'geography': { icon: '⛰️', color: 'gray', label: '地理' },
                        'culture': { icon: '🎓', color: 'pink', label: '文化' },
                        'meiji': { icon: '🚂', color: 'teal', label: '近代化' },
                        'ancient': { icon: '🏺', color: 'amber', label: '古代' }
                      }
                      return categoryMap[category || ''] || { icon: '📍', color: 'orange', label: '史跡' }
                    }
                    
                    const categoryInfo = getCategoryInfo(enhancedSpot.category)
                    
                    return (
                      <button
                        key={spot.place_id}
                        onClick={() => setSelectedSpot(spot)}
                        className={`w-full text-left p-4 rounded-lg border transition ${
                          selectedSpot?.place_id === spot.place_id
                            ? 'border-red-500 bg-red-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center mb-1">
                              <span className="text-lg mr-2">{categoryInfo.icon}</span>
                              <span className="font-semibold text-gray-900 truncate">{spot.name}</span>
                            </div>
                            {enhancedSpot.historical_period && (
                              <div className="text-xs text-gray-600 mb-1">
                                📅 {enhancedSpot.historical_period}
                              </div>
                            )}
                            {enhancedSpot.significance && (
                              <div className="text-xs text-gray-500 mb-2">
                                ⭐ {enhancedSpot.significance}
                              </div>
                            )}
                            <div className="text-sm text-gray-500 truncate">{spot.address}</div>
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium
                              ${categoryInfo.color === 'blue' ? 'bg-red-100 text-red-800' :
                                categoryInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                categoryInfo.color === 'red' ? 'bg-red-100 text-red-800' :
                                categoryInfo.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                                categoryInfo.color === 'indigo' ? 'bg-indigo-100 text-indigo-800' :
                                categoryInfo.color === 'green' ? 'bg-gray-100 text-gray-800' :
                                categoryInfo.color === 'gray' ? 'bg-gray-100 text-gray-800' :
                                categoryInfo.color === 'pink' ? 'bg-pink-100 text-pink-800' :
                                categoryInfo.color === 'teal' ? 'bg-teal-100 text-teal-800' :
                                categoryInfo.color === 'amber' ? 'bg-amber-100 text-amber-800' :
                                'bg-orange-100 text-orange-800'
                              }`}
                            >
                              {categoryInfo.label}
                            </span>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* クイズモード選択 */}
            {selectedSpot && (
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <h3 className="font-semibold mb-3">クイズに挑戦</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setQuizMode('basic')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm transition ${
                      quizMode === 'basic'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    📚 基本クイズ
                  </button>
                  <button
                    onClick={() => setQuizMode('ai')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm transition flex items-center justify-center ${
                      quizMode === 'ai'
                        ? 'bg-gradient-to-r from-red-600 to-red-800 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    AIクイズ
                  </button>
                </div>
              </div>
            )}

            {/* クイズパネル */}
            {selectedSpot && (
              quizMode === 'ai' ? (
                <AIQuizPanel 
                  spot={selectedSpot}
                  onScoreUpdate={handleScoreUpdate}
                />
              ) : (
                <WorkingQuizPanel 
                  spot={selectedSpot}
                  onScoreUpdate={handleScoreUpdate}
                />
              )
            )}

            {/* デフォルトメッセージ */}
            {!selectedSpot && historicalSpots.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">クイズ</h2>
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-4">🎯</div>
                  <p>ルート検索をして</p>
                  <p>学びスポットでクイズに挑戦しよう！</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}