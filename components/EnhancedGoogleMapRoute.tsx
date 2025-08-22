'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import toast from 'react-hot-toast'

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
  category?: string
  historical_period?: string
  significance?: string
}

interface EnhancedGoogleMapRouteProps {
  onRouteFound: (routeInfo: RouteInfo) => void
  onSpotsFound: (spots: HistoricalSpot[]) => void
}

export function EnhancedGoogleMapRoute({ onRouteFound, onSpotsFound }: EnhancedGoogleMapRouteProps) {
  const [origin, setOrigin] = useState('東京駅')
  const [destination, setDestination] = useState('鎌倉駅')
  const [loading, setLoading] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null)
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null)
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])

  // Azure環境変数から取得（Next.js本番環境対応）
  const [GOOGLE_MAPS_API_KEY, setGoogleMapsApiKey] = useState<string | null>(null)
  
  // 本番環境でのAPIキー取得
  useEffect(() => {
    // サーバーサイドで環境変数を取得してクライアントに渡す
    const getApiKey = async () => {
      try {
        const response = await fetch('/api/config')
        if (response.ok) {
          const config = await response.json()
          setGoogleMapsApiKey(config.googleMapsApiKey)
        } else {
          // フォールバック: windowオブジェクトから取得
          const windowApiKey = (window as any).__GOOGLE_MAPS_API_KEY
          if (windowApiKey) {
            setGoogleMapsApiKey(windowApiKey)
          }
        }
      } catch (error) {
        console.error('API key fetch failed:', error)
        // 最終フォールバック
        const windowApiKey = (window as any).__GOOGLE_MAPS_API_KEY
        if (windowApiKey) {
          setGoogleMapsApiKey(windowApiKey)
        }
      }
    }
    
    getApiKey()
  }, [])

  // 教育的価値の高いキーワードリスト（日本史・地理に特化）
  const EDUCATIONAL_KEYWORDS = {
    // 時代別史跡
    ancient: ['古墳', '遺跡', '貝塚', '縄文', '弥生', '古代'],
    nara_heian: ['奈良時代', '平安時代', '都', '国分寺', '荘園跡'],
    kamakura: ['鎌倉時代', '武家', '御家人', '執権', '守護', '地頭'],
    muromachi: ['室町時代', '足利', '南北朝', '応仁の乱'],
    sengoku: ['戦国時代', '城', '城跡', '武将', '合戦場', '古戦場'],
    edo: ['江戸時代', '宿場', '街道', '関所', '藩', '代官所', '陣屋'],
    meiji: ['明治', '文明開化', '鉄道', '洋館', '近代化遺産'],
    
    // 地理・自然
    geography: ['山', '川', '湖', '海岸', '峠', '渓谷', '温泉', '火山'],
    
    // 文化財カテゴリ
    temples: ['寺', '寺院', '本堂', '五重塔', '仏像', '国宝'],
    shrines: ['神社', '大社', '神宮', '鳥居', '本殿'],
    castles: ['城', '天守', '城址', '城跡', '砦', '要塞'],
    
    // 人物・事件関連
    historical_figures: ['生誕地', '終焉の地', '墓', '菩提寺', '屋敷跡'],
    battles: ['古戦場', '合戦', '戦跡', '陣地跡'],
    
    // 産業・文化
    industry: ['宿場町', '港', '市場跡', '鉱山', '製鉄', '窯跡'],
    culture: ['歌舞伎', '能楽', '茶室', '庭園', '美術館', '博物館']
  }

  // カテゴリごとの検索優先順位
  const SEARCH_PRIORITIES = [
    { category: 'castles', weight: 1.0 },
    { category: 'temples', weight: 0.9 },
    { category: 'shrines', weight: 0.9 },
    { category: 'battles', weight: 0.95 },
    { category: 'historical_figures', weight: 0.85 },
    { category: 'edo', weight: 0.8 },
    { category: 'sengoku', weight: 0.85 },
    { category: 'geography', weight: 0.7 }
  ]

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      console.log('⏳ Waiting for Google Maps API key...')
      return
    }

    console.log('🗺️ Initializing Google Maps with API key:', `${GOOGLE_MAPS_API_KEY.substring(0, 10)}...`)

    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry'],
      language: 'ja'
    })

    loader.load().then(() => {
      console.log('✅ Google Maps API loaded successfully')
      if (!mapRef.current) return

      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 35.6812, lng: 139.7671 },
        zoom: 10,
        mapTypeControl: true,
        streetViewControl: true
      })

      console.log('✅ Google Maps instance created')

      mapInstanceRef.current = map
      directionsServiceRef.current = new google.maps.DirectionsService()
      directionsRendererRef.current = new google.maps.DirectionsRenderer()
      placesServiceRef.current = new google.maps.places.PlacesService(map)

      directionsRendererRef.current.setMap(map)
    }).catch((error) => {
      console.error('❌ Google Maps API loading error:', error)
      toast.error('Google Maps の読み込みに失敗しました')
    })
  }, [GOOGLE_MAPS_API_KEY])

  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []
  }

  const searchRoute = useCallback(async () => {
    if (!directionsServiceRef.current || !directionsRendererRef.current || !mapInstanceRef.current) {
      toast.error('地図が初期化されていません')
      return
    }

    if (!origin.trim() || !destination.trim()) {
      toast.error('出発地と目的地を入力してください')
      return
    }

    setLoading(true)
    clearMarkers()

    try {
      const request: google.maps.DirectionsRequest = {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        language: 'ja',
        avoidHighways: false, // 高速道路も含めて幅広く検索
        avoidTolls: false
      }

      const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        directionsServiceRef.current!.route(request, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            resolve(result)
          } else {
            reject(new Error(`ルート検索に失敗しました: ${status}`))
          }
        })
      })

      directionsRendererRef.current.setDirections(result)

      const route = result.routes[0]
      const leg = route.legs[0]

      const routeInfo: RouteInfo = {
        origin,
        destination,
        distance: leg.distance?.text || '不明',
        duration: leg.duration?.text || '不明',
        route
      }

      onRouteFound(routeInfo)

      // 教育的価値の高い歴史スポットを検索
      await searchEnhancedHistoricalSpots(route)

      toast.success('ルートと歴史スポットが見つかりました！')
    } catch (error) {
      console.error('Route search error:', error)
      toast.error('ルート検索に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [origin, destination, onRouteFound, onSpotsFound])

  const searchEnhancedHistoricalSpots = async (route: google.maps.DirectionsRoute) => {
    if (!placesServiceRef.current || !mapInstanceRef.current) return

    try {
      const path = route.overview_path
      const historicalSpots: HistoricalSpot[] = []
      const processedPlaceIds = new Set<string>()
      
      // ルートを地理的に10分割して均等分散検索
      const SEGMENTS = 10  // 10区間に分割
      const samplePoints: google.maps.LatLng[] = []
      
      // パス全体を10等分する
      const pathLength = path.length
      for (let segment = 0; segment < SEGMENTS; segment++) {
        const segmentIndex = Math.floor((pathLength - 1) * segment / (SEGMENTS - 1))
        const clampedIndex = Math.min(segmentIndex, pathLength - 1)
        samplePoints.push(path[clampedIndex])
      }

      console.log(`ルートを${SEGMENTS}区間に分割して検索: ${samplePoints.length}ポイント`)

      // 各区間で1つずつ歴史スポットを検索（地理的均等分散）
      for (let segmentIndex = 0; segmentIndex < samplePoints.length && historicalSpots.length < 10; segmentIndex++) {
        const point = samplePoints[segmentIndex]
        let foundSpotForSegment = false
        
        console.log(`区間 ${segmentIndex + 1}/${SEGMENTS} で検索中...`)
        
        // この区間で最適なスポットを1つ見つける
        for (const priority of SEARCH_PRIORITIES) {
          if (foundSpotForSegment) break
          
          const keywords = EDUCATIONAL_KEYWORDS[priority.category as keyof typeof EDUCATIONAL_KEYWORDS]
          if (!keywords) continue
          
          // カテゴリ内のランダムなキーワードを選択
          const keyword = keywords[Math.floor(Math.random() * keywords.length)]
          
          try {
            const request: google.maps.places.PlaceSearchRequest = {
              location: point,
              radius: 8000, // 8km圏内で検索（区間が離れているため範囲を拡大）
              keyword,
              language: 'ja',
              type: 'tourist_attraction' // 観光地に絞る
            }

            const places = await new Promise<google.maps.places.PlaceResult[]>((resolve) => {
              placesServiceRef.current!.nearbySearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                  resolve(results)
                } else {
                  resolve([])
                }
              })
            })

            // 教育的価値でフィルタリング（日本史特化）
            const educationalPlaces = places.filter(place => {
              if (!place.name || !place.place_id) return false
              if (processedPlaceIds.has(place.place_id)) return false
              
              // 日本史教育価値の判定
              const name = place.name!.toLowerCase() // 上でnullチェック済み
              const types = place.types || []
              
              // 避けるべき場所（商業施設、現代施設など）
              const avoidTypes = ['restaurant', 'cafe', 'shopping_mall', 'store', 'lodging', 'gas_station', 'parking', 'bank']
              if (types.some(t => avoidTypes.includes(t))) return false
              
              // 歴史的重要度の高いキーワードチェック
              const highValueKeywords = [
                '国宝', '重要文化財', '世界遺産', '史跡', '国指定',
                '城', '天守', '御殿', '門跡', '陣屋',
                '大社', '神宮', '總本山', '本山', '大本山',
                '古墳', '遺跡', '窯跡', '官衙', 
                '合戦', '古戦場', '陣場', '要害',
                '宿場', '関所', '番所', '代官所',
                '明治', '文明開化', '産業遺産'
              ]
              
              const hasHighValueKeyword = place.name ? highValueKeywords.some(keyword => 
                place.name!.includes(keyword)
              ) : false
              
              // 歴史・文化関連の場所を優先
              const preferTypes = ['museum', 'place_of_worship', 'tourist_attraction', 'establishment']
              const hasPreferredType = types.some(t => preferTypes.includes(t))
              
              // 高い評価 + 歴史的キーワード or 推奨タイプ
              const hasHighRating = place.rating && place.rating >= 4.0
              
              return (hasHighValueKeyword || hasPreferredType) && (hasHighRating || hasHighValueKeyword)
            }).sort((a, b) => {
              // 教育的価値順にソート
              const getEducationalScore = (place: any) => {
                let score = 0
                const name = place.name || ''
                
                // 国宝・重要文化財は最高優先
                if (name.includes('国宝') || name.includes('重要文化財')) score += 100
                if (name.includes('世界遺産')) score += 90
                if (name.includes('史跡')) score += 80
                
                // 歴史的建造物
                if (name.includes('城') || name.includes('天守')) score += 70
                if (name.includes('神社') || name.includes('大社')) score += 60
                if (name.includes('寺') || name.includes('院')) score += 60
                
                // 古戦場・遺跡
                if (name.includes('古戦場') || name.includes('合戦')) score += 75
                if (name.includes('古墳') || name.includes('遺跡')) score += 65
                
                // 評価も考慮
                if (place.rating) score += place.rating * 5
                
                return score
              }
              
              return getEducationalScore(b) - getEducationalScore(a)
            })

            // この区間で最も教育的価値の高いスポット1つを選択
            if (educationalPlaces.length > 0) {
              const bestPlace = educationalPlaces[0] // 既にソート済みなので最初が最高スコア
              
              if (bestPlace.place_id && !processedPlaceIds.has(bestPlace.place_id)) {
                processedPlaceIds.add(bestPlace.place_id)

                // 詳細情報を取得
                const details = await getPlaceDetails(bestPlace.place_id)
                
                const spot: HistoricalSpot = {
                  place_id: bestPlace.place_id,
                  name: bestPlace.name || '不明な場所',
                  address: bestPlace.vicinity || details?.formatted_address || '',
                  lat: bestPlace.geometry?.location?.lat() || 0,
                  lng: bestPlace.geometry?.location?.lng() || 0,
                  description: generateEnhancedDescription(bestPlace.name || '', keyword, priority.category),
                  category: priority.category,
                  historical_period: getHistoricalPeriod(bestPlace.name || '', keyword),
                  significance: getHistoricalSignificance(bestPlace.name || '', priority.category)
                }

                historicalSpots.push(spot)
                addMarkerToMap(spot)
                foundSpotForSegment = true
                
                console.log(`区間 ${segmentIndex + 1}: ${spot.name} を発見`)
              }
            }
          } catch (error) {
            console.error(`Places search error for keyword ${keyword}:`, error)
          }
        }
      }

      // 重複を除去し、距離順にソート
      const uniqueSpots = Array.from(
        new Map(historicalSpots.map(spot => [spot.place_id, spot])).values()
      )

      console.log(`発見した歴史スポット数: ${uniqueSpots.length}`)
      onSpotsFound(uniqueSpots)
      
    } catch (error) {
      console.error('Historical spots search error:', error)
      toast.error('歴史スポットの検索に失敗しました')
    }
  }

  const getPlaceDetails = async (placeId: string): Promise<google.maps.places.PlaceResult | null> => {
    if (!placesServiceRef.current) return null

    return new Promise((resolve) => {
      placesServiceRef.current!.getDetails(
        {
          placeId,
          fields: ['name', 'formatted_address', 'types', 'opening_hours', 'website', 'photos'],
          language: 'ja'
        },
        (result, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && result) {
            resolve(result)
          } else {
            resolve(null)
          }
        }
      )
    })
  }

  const generateEnhancedDescription = (name: string, keyword: string, category: string): string => {
    // 有名な固有名詞に対する特別な説明（優先度高）
    if (name.includes('鶴岡八幡宮')) {
      return `${name}は源頼朝が鎌倉幕府の守護神として整備し、武家政権の精神的中心となった神社です。`
    } else if (name.includes('建長寺')) {
      return `${name}は鎌倉五山第一位の禅宗寺院で、日本における臨済宗の中心道場として栄えました。`
    } else if (name.includes('円覚寺')) {
      return `${name}は北条時宗が元寇の戦没者追悼のため創建した、鎌倉五山第二位の名刹です。`
    } else if (name.includes('小田原城')) {
      return `${name}は戦国時代に北条氏の本拠地として難攻不落を誇り、関東支配の要となった城郭です。`
    } else if (name.includes('江島神社') || name.includes('江ノ島')) {
      return `${name}は日本三大弁財天の一つで、海上交通の守護神として古来より信仰を集めています。`
    } else if (name.includes('大仏') || name.includes('高徳院')) {
      return `${name}は鎌倉時代に建立された国宝の大仏を擁し、日本の仏教彫刻の最高傑作の一つです。`
    } else if (name.includes('報国寺')) {
      return `${name}は竹の庭で有名な臨済宗の寺院で、足利家時ゆかりの歴史を持ちます。`
    } else if (name.includes('長谷寺')) {
      return `${name}は十一面観音像で知られ、鎌倉の海を見渡す景勝地としても親しまれています。`
    }
    
    // キーワードベースの詳細な説明（カテゴリーと組み合わせ）
    const descriptions: { [key: string]: { [key: string]: string } } = {
      castles: {
        default: `${name}は日本の城郭建築の歴史を物語る重要な史跡です。`,
        '城': `${name}は戦国時代から江戸時代にかけての日本の軍事・政治の中心地でした。`,
        '天守': `${name}の天守は、当時の建築技術と防御思想を現代に伝える貴重な文化財です。`,
        '城跡': `${name}は往時の城郭の姿を偲ばせる重要な遺跡です。`,
        '城址': `${name}は歴史の舞台となった城の跡地で、当時の石垣や堀が残されています。`
      },
      temples: {
        default: `${name}は日本の仏教文化と建築技術の粋を集めた寺院です。`,
        '寺': `${name}は長い歴史を持ち、地域の信仰の中心として栄えてきました。`,
        '院': `${name}は格式高い寺院で、多くの文化財を今に伝えています。`,
        '国宝': `${name}には国宝に指定された貴重な文化財が保存されています。`,
        '五重塔': `${name}の五重塔は、日本建築の美と技術の結晶です。`,
        '観音': `${name}は観世音菩薩を本尊とし、人々の願いを聞き届ける霊場です。`,
        '不動': `${name}は不動明王を祀り、厄除けの霊場として信仰されています。`,
        '地蔵': `${name}は地蔵菩薩を祀り、子供の守護と旅の安全を願う寺院です。`
      },
      shrines: {
        default: `${name}は日本の神道文化と地域の歴史を今に伝える神社です。`,
        '神社': `${name}は古来より地域の守り神として崇敬されてきました。`,
        '大社': `${name}は全国に分社を持つ、格式高い神社です。`,
        '八幡': `${name}は武家の守護神・八幡神を祀る由緒ある神社です。`,
        '稲荷': `${name}は商売繁盛・五穀豊穣の神として信仰される稲荷神社です。`,
        '天満': `${name}は学問の神・菅原道真を祀る天満宮です。`,
        '神宮': `${name}は皇室とゆかりが深い、格式の高い神社です。`
      },
      battles: {
        default: `${name}は日本史上の重要な戦いが行われた場所です。`,
        '古戦場': `${name}では歴史を変えた重要な合戦が繰り広げられました。`,
        '合戦': `${name}の戦いは、その後の日本の歴史に大きな影響を与えました。`,
        '戦跡': `${name}は戦国時代の激戦地として知られる史跡です。`
      },
      edo: {
        default: `${name}は江戸時代の日本の姿を今に伝える貴重な史跡です。`,
        '宿場': `${name}は江戸時代の五街道の要所として栄えた宿場町でした。`,
        '街道': `${name}は江戸と地方を結ぶ重要な交通路でした。`,
        '関所': `${name}は江戸幕府の治安維持のため設置された関所跡です。`
      },
      geography: {
        default: `${name}は日本の自然地理と人々の暮らしの関わりを学べる場所です。`,
        '山': `${name}は古来より信仰の対象となり、日本の山岳文化を育んできました。`,
        '川': `${name}は流域の文化と産業の発展に重要な役割を果たしてきました。`,
        '湖': `${name}は景勝地として知られ、多くの文学作品の舞台となってきました。`
      }
    }
    
    // カテゴリーと一致する説明を探す
    const categoryDescs = descriptions[category] || descriptions.default
    if (categoryDescs) {
      // キーワードに一致する説明を探す
      for (const [key, desc] of Object.entries(categoryDescs)) {
        if (key !== 'default' && name.includes(key)) {
          return desc
        }
      }
      // デフォルト説明を返す
      if (categoryDescs.default) {
        return categoryDescs.default
      }
    }
    
    // 最終的なフォールバック
    return `${name}は日本の歴史と文化を学ぶ上で重要な場所です。`
  }

  const getHistoricalPeriod = (name: string, keyword: string): string => {
    const periods: { [key: string]: string } = {
      '古墳': '古墳時代（3世紀〜7世紀）',
      '奈良': '奈良時代（710年〜794年）',
      '平安': '平安時代（794年〜1185年）',
      '鎌倉': '鎌倉時代（1185年〜1333年）',
      '室町': '室町時代（1336年〜1573年）',
      '戦国': '戦国時代（1467年〜1615年）',
      '江戸': '江戸時代（1603年〜1868年）',
      '明治': '明治時代（1868年〜1912年）',
      '大正': '大正時代（1912年〜1926年）',
      '昭和': '昭和時代（1926年〜1989年）'
    }

    for (const [key, period] of Object.entries(periods)) {
      if (name.includes(key) || keyword.includes(key)) {
        return period
      }
    }

    return '複数の時代にわたる'
  }

  const getHistoricalSignificance = (name: string, category: string): string => {
    // スポット名から重要性を動的に判定
    
    // 固有名詞による特別な重要性
    if (name.includes('鶴岡八幡宮')) {
      return '鎌倉幕府の精神的中枢'
    } else if (name.includes('建長寺') || name.includes('円覚寺')) {
      return '鎌倉五山の中核寺院'
    } else if (name.includes('小田原城')) {
      return '関東支配の要衝'
    } else if (name.includes('大仏') || name.includes('高徳院')) {
      return '国宝・文化財の宝庫'
    } else if (name.includes('江島') || name.includes('江ノ島')) {
      return '海上交通の要所'
    }
    
    // キーワードによる重要性の判定
    if (name.includes('八幡')) {
      return '武家の守護神社'
    } else if (name.includes('稲荷')) {
      return '商業・農業の守護社'
    } else if (name.includes('天満') || name.includes('天神')) {
      return '学問・文化の聖地'
    } else if (name.includes('五山') || name.includes('十刹')) {
      return '禅宗の名刹'
    } else if (name.includes('国宝') || name.includes('重要文化財')) {
      return '文化財保護地'
    } else if (name.includes('城') || name.includes('城跡')) {
      return '防衛・統治の拠点'
    } else if (name.includes('宿') || name.includes('宿場')) {
      return '街道文化の継承地'
    } else if (name.includes('港') || name.includes('湊')) {
      return '海運・交易の中心'
    } else if (name.includes('市') || name.includes('市場')) {
      return '商業・経済の中心地'
    }
    
    // カテゴリーベースの重要性（多様化版）
    const categorySignificance: { [key: string]: string[] } = {
      castles: ['防衛・統治の拠点', '武家文化の象徴', '築城技術の結晶'],
      temples: ['仏教文化の中心', '学問・修行の道場', '芸術文化の保護地', '地域信仰の拠点'],
      shrines: ['神道信仰の聖地', '地域守護の中心', '祭礼文化の継承地', '氏子共同体の核'],
      battles: ['歴史的転換点', '武士道精神の舞台', '戦略要地'],
      historical_figures: ['偉人ゆかりの地', '文化継承の場', '歴史教育の拠点'],
      edo: ['江戸文化の遺産', '街道文化の要所', '町人文化の発祥地'],
      geography: ['自然崇拝の対象', '産業発展の基盤', '交通の要衝']
    }
    
    // カテゴリーに応じてランダムに選択（多様性を持たせる）
    const significanceList = categorySignificance[category]
    if (significanceList && significanceList.length > 0) {
      // スポット名のハッシュ値を使って決定的に選択（同じスポットは常に同じ重要性）
      const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      return significanceList[hash % significanceList.length]
    }
    
    return '歴史文化遺産'
  }

  const addMarkerToMap = (spot: HistoricalSpot) => {
    if (!mapInstanceRef.current) return

    const markerColors: { [key: string]: string } = {
      castles: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      temples: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
      shrines: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      battles: 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png',
      default: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png'
    }

    const marker = new google.maps.Marker({
      position: { lat: spot.lat, lng: spot.lng },
      map: mapInstanceRef.current,
      title: spot.name,
      icon: {
        url: markerColors[spot.category || ''] || markerColors.default
      }
    })

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="max-width: 300px; padding: 10px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${spot.name}</h3>
          ${spot.historical_period ? `<p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">時代: ${spot.historical_period}</p>` : ''}
          ${spot.significance ? `<p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">重要性: ${spot.significance}</p>` : ''}
          <p style="margin: 8px 0; font-size: 13px;">${spot.description}</p>
          <p style="margin: 0; font-size: 11px; color: #888;">${spot.address}</p>
        </div>
      `
    })

    marker.addListener('click', () => {
      infoWindow.open(mapInstanceRef.current, marker)
    })

    markersRef.current.push(marker)
  }

  if (GOOGLE_MAPS_API_KEY === null) {
    // APIキー読み込み中
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Google Maps を初期化しています...</p>
        </div>
      </div>
    )
  }

  if (!GOOGLE_MAPS_API_KEY) {
    // APIキーが見つからない場合
    console.error('🚨 Google Maps API Key not found!')
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-red-600">
          <p>Google Maps API キーが設定されていません</p>
          <p className="text-sm">Azure App Service の環境変数を確認してください</p>
          <p className="text-xs mt-2 text-gray-500">
            APIキー取得に失敗しました
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">ルート検索</h2>
        
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-700">
ルート沿いの歴史スポットを検索！スポットのクイズも生成！
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              出発地
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="例: 東京駅"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              目的地
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="例: 鎌倉駅"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
        
        <button
          onClick={searchRoute}
          disabled={loading}
          className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '検索中...' : 'ルートを検索'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="mb-2">
          <span className="text-sm font-medium text-gray-700">マーカーの凡例: </span>
          <span className="text-xs text-red-600 ml-2">● 城郭</span>
          <span className="text-xs text-yellow-600 ml-2">● 寺院</span>
          <span className="text-xs text-red-600 ml-2">● 神社</span>
          <span className="text-xs text-purple-600 ml-2">● 古戦場</span>
          <span className="text-xs text-orange-600 ml-2">● その他</span>
        </div>
        <div 
          ref={mapRef} 
          className="w-full h-[600px] rounded-lg"
          style={{ minHeight: '600px' }}
        />
      </div>
    </div>
  )
}