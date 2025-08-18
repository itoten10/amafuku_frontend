'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

interface RouteInfo {
  origin: string
  destination: string
  distance: string
  duration: string
  route: null
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

interface EnhancedSampleMapRouteProps {
  onRouteFound: (routeInfo: RouteInfo) => void
  onSpotsFound: (spots: HistoricalSpot[]) => void
}

export function EnhancedSampleMapRoute({ onRouteFound, onSpotsFound }: EnhancedSampleMapRouteProps) {
  const [origin, setOrigin] = useState('東京駅')
  const [destination, setDestination] = useState('鎌倉駅')
  const [loading, setLoading] = useState(false)

  // 教育的価値の高い日本各地の歴史スポットデータベース（厳選10箇所）
  const EDUCATIONAL_SPOTS_DATABASE = {
    '関東': {
      '東京-鎌倉': [
        {
          place_id: 'enhanced_1',
          name: '鎌倉大仏（高徳院）',
          address: '神奈川県鎌倉市長谷4-2-28',
          lat: 35.3169,
          lng: 139.5359,
          description: '1252年に建立された高さ11.3mの阿弥陀如来坐像。鎌倉時代の仏教文化と青銅鋳造技術の最高峰を示す国宝です。',
          category: 'temples',
          historical_period: '鎌倉時代（1185年〜1333年）',
          significance: '鎌倉仏教文化の象徴'
        },
        {
          place_id: 'enhanced_2',
          name: '鶴岡八幡宮',
          address: '神奈川県鎌倉市雪ノ下2-1-31',
          lat: 35.3249,
          lng: 139.5565,
          description: '源頼朝が1180年に現在地に遷座した鎌倉幕府の守護神。武家政権の成立と発展を象徴する重要な神社です。',
          category: 'shrines',
          historical_period: '鎌倉時代（1185年〜1333年）',
          significance: '武家政権の精神的支柱'
        },
        {
          place_id: 'enhanced_3',
          name: '建長寺',
          address: '神奈川県鎌倉市山ノ内8',
          lat: 35.3374,
          lng: 139.5526,
          description: '1253年創建の日本最古の禅寺。北条時頼が蘭渓道隆を招いて開山。禅宗の日本伝来と発展の拠点となりました。',
          category: 'temples',
          historical_period: '鎌倉時代（1185年〜1333年）',
          significance: '日本禅宗の発祥地'
        },
        {
          place_id: 'enhanced_4',
          name: '江島神社',
          address: '神奈川県藤沢市江島2-3-8',
          lat: 35.3006,
          lng: 139.4778,
          description: '552年創建と伝わる海の神を祀る神社。江戸時代には庶民の信仰を集め、江島詣が大流行しました。',
          category: 'shrines',
          historical_period: '古代〜現代',
          significance: '庶民信仰の聖地'
        },
        {
          place_id: 'enhanced_5',
          name: '小田原城',
          address: '神奈川県小田原市城内6-1',
          lat: 35.2559,
          lng: 139.1547,
          description: '戦国時代に北条氏の本拠地として栄えた平山城。豊臣秀吉の小田原征伐（1590年）の舞台となり、戦国時代の終焉を告げる歴史的舞台です。',
          category: 'castles',
          historical_period: '戦国時代（1467年〜1615年）',
          significance: '戦国時代終焉の舞台'
        },
        {
          place_id: 'enhanced_6',
          name: '太田道灌墓所（大慈寺）',
          address: '神奈川県伊勢原市上粕屋1762',
          lat: 35.4014,
          lng: 139.2937,
          description: '江戸城築城で知られる太田道灌の墓所。室町時代後期の関東管領上杉氏の重臣で、江戸発展の礎を築いた武将です。',
          category: 'historical_figures',
          historical_period: '室町時代（1336年〜1573年）',
          significance: '江戸発展の礎を築いた武将'
        },
        {
          place_id: 'enhanced_7',
          name: '頼朝の墓（法華堂跡）',
          address: '神奈川県鎌倉市西御門2-6',
          lat: 35.3255,
          lng: 139.5582,
          description: '鎌倉幕府初代将軍源頼朝の墓所。日本初の武家政権を確立し、以後約700年続く武士の時代の礎を築いた歴史的人物の眠る地です。',
          category: 'historical_figures',
          historical_period: '鎌倉時代（1185年〜1333年）',
          significance: '武家政権の創始者'
        },
        {
          place_id: 'enhanced_8',
          name: '箱根関所跡',
          address: '神奈川県足柄下郡箱根町箱根1',
          lat: 35.2104,
          lng: 139.0240,
          description: '江戸時代の重要な関所跡。「入り鉄砲に出女」で有名な厳しい検問が行われ、江戸幕府の治安維持政策の象徴的存在でした。',
          category: 'edo',
          historical_period: '江戸時代（1603年〜1868年）',
          significance: '江戸幕府統制政策の象徴'
        }
      ],
      '東京-京都': [
        {
          place_id: 'enhanced_kyoto_1',
          name: '関ヶ原古戦場',
          address: '岐阜県不破郡関ケ原町関ケ原',
          lat: 35.3627,
          lng: 136.4664,
          description: '1600年、徳川家康と石田三成が激突した天下分け目の戦い。この戦いで江戸幕府成立の基礎が築かれました。',
          category: 'battles',
          historical_period: '安土桃山時代（1573年〜1603年）',
          significance: '日本統一の決戦地'
        },
        {
          place_id: 'enhanced_kyoto_2',
          name: '東海道品川宿跡',
          address: '東京都品川区北品川2丁目',
          lat: 35.6197,
          lng: 139.7404,
          description: '江戸時代の東海道五十三次の第一番目の宿場町。江戸の玄関口として多くの人々が往来し、宿場町文化が栄えました。',
          category: 'edo',
          historical_period: '江戸時代（1603年〜1868年）',
          significance: '江戸時代交通の要衝'
        },
        {
          place_id: 'enhanced_kyoto_3',
          name: '富士山',
          address: '静岡県・山梨県',
          lat: 35.3606,
          lng: 138.7274,
          description: '古来より信仰の対象とされてきた日本最高峰の成層火山。富士講など独特の山岳信仰を育み、日本文化の象徴となっています。',
          category: 'geography',
          historical_period: '古代〜現代',
          significance: '日本文化の象徴的存在'
        },
        {
          place_id: 'enhanced_kyoto_4',
          name: '駿府城跡',
          address: '静岡県静岡市葵区駿府城公園1-1',
          lat: 34.9777,
          lng: 138.3836,
          description: '徳川家康が大御所として晩年を過ごした城。江戸幕府の実質的な政治中枢として機能し、家康の天下統一事業の完成を見届けた場所です。',
          category: 'castles',
          historical_period: '江戸時代（1603年〜1868年）',
          significance: '徳川政権の完成地'
        },
        {
          place_id: 'enhanced_kyoto_5',
          name: '本能寺跡',
          address: '京都府京都市中京区寺町通御池下る下本能寺前町522',
          lat: 35.0087,
          lng: 135.7695,
          description: '1582年、織田信長が明智光秀の謀反により自害した本能寺の変の舞台。戦国時代の終焉と近世への転換点となった日本史上最も有名な事件の現場です。',
          category: 'battles',
          historical_period: '安土桃山時代（1573年〜1603年）',
          significance: '戦国時代終焉の転換点'
        },
        {
          place_id: 'enhanced_kyoto_6',
          name: '東海道川崎宿跡',
          address: '神奈川県川崎市川崎区本町1丁目',
          lat: 35.5308,
          lng: 139.6970,
          description: '東海道五十三次の2番目の宿場町。江戸と京都を結ぶ重要な交通路の要所として栄え、庶民の旅や物流の拠点となりました。',
          category: 'edo',
          historical_period: '江戸時代（1603年〜1868年）',
          significance: '東海道交通の要衝'
        }
      ]
    },
    '関西': {
      '京都-奈良': [
        {
          place_id: 'enhanced_kansai_1',
          name: '清水寺',
          address: '京都府京都市東山区清水1-294',
          lat: 34.9949,
          lng: 135.7849,
          description: '778年創建の法相宗の寺院。「清水の舞台」で有名な本堂は釘を一本も使わない懸造り建築の傑作で、国宝に指定されています。',
          category: 'temples',
          historical_period: '奈良時代〜現代',
          significance: '古都京都の象徴'
        },
        {
          place_id: 'enhanced_kansai_2',
          name: '東大寺大仏殿',
          address: '奈良県奈良市雑司町406-1',
          lat: 34.6890,
          lng: 135.8396,
          description: '743年に聖武天皇の発願で建立開始。752年開眼供養が行われた盧舎那仏は奈良時代の国家仏教政策の象徴です。',
          category: 'temples',
          historical_period: '奈良時代（710年〜794年）',
          significance: '古代日本の国家仏教の中心'
        },
        {
          place_id: 'enhanced_kansai_3',
          name: '春日大社',
          address: '奈良県奈良市春日野町160',
          lat: 34.6818,
          lng: 135.8479,
          description: '768年創建の藤原氏の氏神を祀る神社。約3000基の石燈籠と約1000基の釣燈籠で知られ、古代貴族文化を今に伝えます。',
          category: 'shrines',
          historical_period: '奈良時代（710年〜794年）',
          significance: '古代貴族文化の遺産'
        },
        {
          place_id: 'enhanced_kansai_4',
          name: '法隆寺',
          address: '奈良県生駒郡斑鳩町法隆寺山内1-1',
          lat: 34.6142,
          lng: 135.7342,
          description: '607年に聖徳太子と推古天皇により建立された世界最古の木造建築群。仏教伝来と古代日本の国際化を象徴する世界文化遺産です。',
          category: 'temples',
          historical_period: '飛鳥時代（593年〜710年）',
          significance: '仏教文化東漸の象徴'
        },
        {
          place_id: 'enhanced_kansai_5',
          name: '平城宮跡',
          address: '奈良県奈良市佐紀町',
          lat: 34.6911,
          lng: 135.7956,
          description: '710年から784年まで日本の都として栄えた平城京の中心部。律令国家の政治中枢として機能し、古代日本の国家形成を物語る特別史跡です。',
          category: 'ancient',
          historical_period: '奈良時代（710年〜794年）',
          significance: '古代律令国家の中心地'
        },
        {
          place_id: 'enhanced_kansai_6',
          name: '二条城',
          address: '京都府京都市中京区二条通堀川西入二条城町541',
          lat: 35.0142,
          lng: 135.7481,
          description: '1603年に徳川家康が築城し、1867年に大政奉還が行われた江戸幕府の象徴的建造物。江戸時代の始まりと終わりを見届けた歴史の舞台です。',
          category: 'castles',
          historical_period: '江戸時代（1603年〜1868年）',
          significance: '幕末維新の歴史的舞台'
        }
      ]
    },
    '中国・四国': {
      '広島-松山': [
        {
          place_id: 'enhanced_chushikoku_1',
          name: '厳島神社',
          address: '広島県廿日市市宮島町1-1',
          lat: 34.2964,
          lng: 132.3198,
          description: '推古天皇元年（593年）創建と伝わる海中の神社。平清盛の庇護により現在の規模となり、平家の栄華を物語ります。',
          category: 'shrines',
          historical_period: '平安時代（794年〜1185年）',
          significance: '平家政権の象徴'
        },
        {
          place_id: 'enhanced_chushikoku_2',
          name: '松山城',
          address: '愛媛県松山市丸之内1',
          lat: 33.8464,
          lng: 132.7658,
          description: '1602年から加藤嘉明が築城開始。現存12天守の一つで、江戸時代の城郭建築技術の粋を集めた平山城です。',
          category: 'castles',
          historical_period: '江戸時代（1603年〜1868年）',
          significance: '現存天守の貴重な遺構'
        }
      ]
    }
  }

  const searchRoute = () => {
    console.log('🔍 Sample mode search triggered:', { origin, destination })
    
    if (!origin.trim() || !destination.trim()) {
      toast.error('出発地と目的地を入力してください')
      return
    }

    console.log('✅ Starting sample route search')
    setLoading(true)

    setTimeout(() => {
      const routeInfo: RouteInfo = {
        origin,
        destination,
        distance: getDistance(origin, destination),
        duration: getDuration(origin, destination),
        route: null
      }

      const spots = getEnhancedHistoricalSpots(origin, destination)

      onRouteFound(routeInfo)
      onSpotsFound(spots)
      
      toast.success(`${spots.length}個の教育的歴史スポットが見つかりました！`)
      setLoading(false)
    }, 1500)
  }

  const getDistance = (origin: string, destination: string): string => {
    const routes: { [key: string]: string } = {
      '東京駅-鎌倉駅': '51.2 km',
      '東京駅-京都駅': '476.3 km',
      '東京駅-大阪駅': '515.4 km',
      '京都駅-奈良駅': '45.7 km',
      '広島駅-松山駅': '156.2 km'
    }
    
    const key = `${origin}-${destination}`
    return routes[key] || `${Math.floor(Math.random() * 200 + 50)} km`
  }

  const getDuration = (origin: string, destination: string): string => {
    const routes: { [key: string]: string } = {
      '東京駅-鎌倉駅': '1時間 12分',
      '東京駅-京都駅': '6時間 23分',
      '東京駅-大阪駅': '7時間 12分',
      '京都駅-奈良駅': '1時間 15分',
      '広島駅-松山駅': '2時間 45分'
    }
    
    const key = `${origin}-${destination}`
    return routes[key] || `${Math.floor(Math.random() * 4 + 2)}時間 ${Math.floor(Math.random() * 60)}分`
  }

  const getEnhancedHistoricalSpots = (origin: string, destination: string): HistoricalSpot[] => {
    // ルートに基づいて適切な教育スポットを選択
    let allSpots: HistoricalSpot[] = []
    
    if (destination.includes('鎌倉') || origin.includes('鎌倉')) {
      allSpots = EDUCATIONAL_SPOTS_DATABASE['関東']['東京-鎌倉']
    } else if (destination.includes('京都') || origin.includes('京都') || 
               destination.includes('大阪') || origin.includes('大阪')) {
      allSpots = EDUCATIONAL_SPOTS_DATABASE['関東']['東京-京都']
    } else if ((destination.includes('京都') && origin.includes('奈良')) ||
               (destination.includes('奈良') && origin.includes('京都'))) {
      allSpots = EDUCATIONAL_SPOTS_DATABASE['関西']['京都-奈良']
    } else if (destination.includes('松山') || destination.includes('広島') ||
               origin.includes('松山') || origin.includes('広島')) {
      allSpots = EDUCATIONAL_SPOTS_DATABASE['中国・四国']['広島-松山']
    } else {
      // デフォルトで首都圏の重要歴史スポット（厳選10箇所）を返す
      allSpots = [
        {
          place_id: 'default_1',
          name: '皇居東御苑（江戸城跡）',
          address: '東京都千代田区千代田1-1',
          lat: 35.6852,
          lng: 139.7528,
          description: '徳川将軍家の居住地として260年間日本の政治中枢だった江戸城の遺構。天守台や富士見櫓など江戸幕府の威容を偲ばせます。',
          category: 'castles',
          historical_period: '江戸時代（1603年〜1868年）',
          significance: '江戸幕府政治の中心地'
        },
        {
          place_id: 'default_2',
          name: '靖国神社',
          address: '東京都千代田区九段北3-1-1',
          lat: 35.6946,
          lng: 139.7444,
          description: '1869年創建の戊辰戦争戦没者を祀る神社。明治維新から太平洋戦争までの日本近代史と戦争の記憶を伝える重要な場所です。',
          category: 'shrines',
          historical_period: '明治時代〜現代',
          significance: '近代日本の戦争史の象徴'
        },
        {
          place_id: 'default_3',
          name: '浅草寺',
          address: '東京都台東区浅草2-3-1',
          lat: 35.7148,
          lng: 139.7967,
          description: '645年創建の東京最古の寺院。江戸時代には庶民の信仰と娯楽の中心地として栄え、江戸文化形成の拠点となりました。',
          category: 'temples',
          historical_period: '飛鳥時代〜現代',
          significance: '江戸庶民文化の中心地'
        },
        {
          place_id: 'default_4',
          name: '東京国立博物館',
          address: '東京都台東区上野公園13-9',
          lat: 35.7188,
          lng: 139.7753,
          description: '1872年創設の日本最古の博物館。国宝・重要文化財を多数収蔵し、日本の文化史と美術史を体系的に学習できる施設です。',
          category: 'culture',
          historical_period: '明治時代〜現代',
          significance: '日本文化史の宝庫'
        },
        {
          place_id: 'default_5',
          name: '増上寺',
          address: '東京都港区芝公園4-7-35',
          lat: 35.6570,
          lng: 139.7489,
          description: '1393年創建の浄土宗大本山。徳川家の菩提寺として6人の将軍が眠り、江戸幕府の宗教政策と徳川家の権威を象徴します。',
          category: 'temples',
          historical_period: '室町時代〜現代',
          significance: '徳川家菩提寺'
        },
        {
          place_id: 'default_6',
          name: '湯島聖堂',
          address: '東京都文京区湯島1-4-25',
          lat: 35.7026,
          lng: 139.7684,
          description: '1690年に5代将軍綱吉が創建した孔子廟。江戸時代の儒学教育の中心地として昌平坂学問所が併設され、近世日本の学問振興の象徴です。',
          category: 'culture',
          historical_period: '江戸時代（1603年〜1868年）',
          significance: '江戸時代学問の中心地'
        },
        {
          place_id: 'default_7',
          name: '品川台場跡',
          address: '東京都港区台場1',
          lat: 35.6297,
          lng: 139.7704,
          description: '1853年のペリー来航を受けて江戸幕府が築いた砲台跡。幕末の攘夷論と開国論の対立、江戸幕府の軍事近代化を物語る史跡です。',
          category: 'battles',
          historical_period: '江戸時代末期（1853年〜1868年）',
          significance: '幕末開国の象徴'
        },
        {
          place_id: 'default_8',
          name: '東京駅丸の内駅舎',
          address: '東京都千代田区丸の内1-9-1',
          lat: 35.6812,
          lng: 139.7671,
          description: '1914年竣工の赤煉瓦駅舎。大正時代の近代建築技術と西洋様式導入を示し、日本の鉄道史と近代化の象徴的建造物です。',
          category: 'meiji',
          historical_period: '大正時代（1912年〜1926年）',
          significance: '日本近代化の象徴'
        },
        {
          place_id: 'default_9',
          name: '築地本願寺',
          address: '東京都中央区築地3-15-1',
          lat: 35.6654,
          lng: 139.7707,
          description: '1617年創建の浄土真宗本願寺派の寺院。関東大震災後の復興建築として古代インド様式を採用し、近代日本の宗教建築史上重要な建物です。',
          category: 'temples',
          historical_period: '江戸時代〜現代',
          significance: '近代復興建築の傑作'
        },
        {
          place_id: 'default_10',
          name: '神田神社（神田明神）',
          address: '東京都千代田区外神田2-16-2',
          lat: 35.7019,
          lng: 139.7717,
          description: '730年創建の江戸総鎮守。江戸時代は将軍家の崇敬を受け、江戸の商工業発展の守護神として庶民の信仰を集めました。',
          category: 'shrines',
          historical_period: '奈良時代〜現代',
          significance: '江戸商業文化の守護神'
        }
      ]
    }

    // 地理的分散ロジック：10区間に分けて均等配置
    return distributeSpotsByDistance(allSpots, origin, destination)
  }

  const distributeSpotsByDistance = (spots: HistoricalSpot[], origin: string, destination: string): HistoricalSpot[] => {
    // サンプルモードでは地理的位置に基づく簡易分散を実装
    const SEGMENTS = 10
    
    // 利用可能なスポット数が10以下の場合はそのまま返す
    if (spots.length <= SEGMENTS) {
      return spots
    }

    // 教育的価値順にソート
    const sortedSpots = spots.sort((a, b) => {
      const getEducationalScore = (spot: HistoricalSpot) => {
        let score = 0
        const name = spot.name || ''
        
        // 国宝・重要文化財は最高優先
        if (name.includes('国宝') || name.includes('重要文化財') || name.includes('世界遺産')) score += 100
        if (name.includes('史跡') || name.includes('特別史跡')) score += 80
        
        // 歴史的建造物
        if (name.includes('城') || name.includes('天守')) score += 70
        if (name.includes('神社') || name.includes('大社') || name.includes('神宮')) score += 60
        if (name.includes('寺') || name.includes('院') || name.includes('本山')) score += 60
        
        // 古戦場・遺跡
        if (name.includes('古戦場') || name.includes('合戦')) score += 75
        if (name.includes('古墳') || name.includes('遺跡')) score += 65
        
        // カテゴリによる追加スコア
        const categoryBonus = {
          'castles': 70,
          'temples': 60,
          'shrines': 60,
          'battles': 75,
          'historical_figures': 55,
          'ancient': 80,
          'edo': 50,
          'meiji': 45
        }
        
        if (spot.category && categoryBonus[spot.category as keyof typeof categoryBonus]) {
          score += categoryBonus[spot.category as keyof typeof categoryBonus]
        }
        
        return score
      }
      
      return getEducationalScore(b) - getEducationalScore(a)
    })

    // 地理的分散を考慮して10個選択
    const selectedSpots: HistoricalSpot[] = []
    const usedCoordinates = new Set<string>()
    const MIN_DISTANCE = 0.01 // 最小間隔（約1km相当）

    for (const spot of sortedSpots) {
      if (selectedSpots.length >= SEGMENTS) break
      
      // 既選択スポットとの距離をチェック
      const spotKey = `${spot.lat.toFixed(3)}_${spot.lng.toFixed(3)}`
      
      let tooClose = false
      for (const selected of selectedSpots) {
        const distance = Math.sqrt(
          Math.pow(spot.lat - selected.lat, 2) + Math.pow(spot.lng - selected.lng, 2)
        )
        if (distance < MIN_DISTANCE) {
          tooClose = true
          break
        }
      }
      
      if (!tooClose && !usedCoordinates.has(spotKey)) {
        selectedSpots.push(spot)
        usedCoordinates.add(spotKey)
      }
    }

    // 10個に満たない場合は、距離制限を緩和して補完
    if (selectedSpots.length < SEGMENTS) {
      for (const spot of sortedSpots) {
        if (selectedSpots.length >= SEGMENTS) break
        if (!selectedSpots.some(s => s.place_id === spot.place_id)) {
          selectedSpots.push(spot)
        }
      }
    }

    return selectedSpots.slice(0, SEGMENTS)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">ルート検索</h2>
        
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Google Maps APIが設定されていません。<br />
            🎓 日本史・地理教育に特化したサンプルデータで動作確認できます。
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            📚 <strong>推奨ルート例：</strong><br />
            • 東京駅 → 鎌倉駅（鎌倉仏教文化を学ぶ）<br />
            • 東京駅 → 京都駅（東海道の歴史を辿る）<br />
            • 京都駅 → 奈良駅（古都の文化を比較する）<br />
            • 広島駅 → 松山駅（瀬戸内の歴史を探る）
          </p>
        </div>
        
        <button
          onClick={searchRoute}
          disabled={loading}
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '検索中...' : '教育的ルート検索（サンプル）'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="w-full h-[600px] rounded-lg bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🗾</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              日本史・地理学習マップ
            </h3>
            <p className="text-gray-600 mb-4">
              教育的価値の高い歴史スポットを<br />
              ルート沿いで学習できます
            </p>
            <div className="bg-white p-4 rounded-lg shadow-sm max-w-md mx-auto">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span>城郭・要塞</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span>寺院・仏閣</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span>神社・神宮</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                  <span>古戦場・史跡</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}