'use client'

import { useState } from 'react'
import { BookOpen, Check, X, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface HistoricalSpot {
  place_id: string
  name: string
  address: string
  lat: number
  lng: number
  description: string
}

interface Quiz {
  id: string
  spot_id: string
  spot_name: string
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  difficulty: string
  points: number
}

interface WorkingQuizPanelProps {
  spot: HistoricalSpot
  onScoreUpdate: (points: number) => void
}

export function WorkingQuizPanel({ spot, onScoreUpdate }: WorkingQuizPanelProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [loading, setLoading] = useState(false)
  const [difficulty, setDifficulty] = useState('中学生')

  const generateQuiz = () => {
    setLoading(true)

    // スポット名に基づいてクイズを生成
    const quizData = generateQuizForSpot(spot.name, difficulty)

    setTimeout(() => {
      setQuiz({
        id: `${spot.place_id}_${Date.now()}`,
        spot_id: spot.place_id,
        spot_name: spot.name,
        ...quizData,
        difficulty,
        points: getPointsForDifficulty(difficulty)
      })
      setSelectedAnswer(null)
      setIsAnswered(false)
      setIsCorrect(false)
      setLoading(false)
    }, 500) // 少し待機時間を追加してUX向上
  }

  const generateQuizForSpot = (spotName: string, difficulty: string) => {
    if (spotName.includes('大仏')) {
      return generateDaibutsuQuiz(spotName, difficulty)
    } else if (spotName.includes('八幡宮')) {
      return generateHachimanQuiz(spotName, difficulty)
    } else if (spotName.includes('神社')) {
      return generateShrineQuiz(spotName, difficulty)
    } else if (spotName.includes('寺') || spotName.includes('院')) {
      return generateTempleQuiz(spotName, difficulty)
    } else if (spotName.includes('城')) {
      return generateCastleQuiz(spotName, difficulty)
    } else {
      return generateGenericQuiz(spotName, difficulty)
    }
  }

  const generateDaibutsuQuiz = (spotName: string, difficulty: string) => {
    const quizzes = {
      "小学生": {
        question: `${spotName}について正しいものはどれでしょう？`,
        options: [
          "とても大きな仏像です",
          "最近作られました",
          "外国から来ました",
          "動くことができます"
        ],
        correct_answer: 0,
        explanation: `${spotName}は高さ11メートルを超える巨大な仏像で、日本の国宝に指定されています。`
      },
      "中学生": {
        question: `${spotName}が建立されたのはいつ頃でしょう？`,
        options: [
          "鎌倉時代（13世紀）",
          "江戸時代（17世紀）",
          "明治時代（19世紀）",
          "昭和時代（20世紀）"
        ],
        correct_answer: 0,
        explanation: `${spotName}は1252年頃の鎌倉時代に建立されました。当時の高い技術力を示しています。`
      },
      "高校生": {
        question: `${spotName}の建立に関わったとされる人物は誰でしょう？`,
        options: [
          "深沢助成",
          "運慶",
          "快慶",
          "康慶"
        ],
        correct_answer: 0,
        explanation: `鎌倉大仏の建立は深沢助成らによって発願されたとされています。`
      }
    }
    return quizzes[difficulty as keyof typeof quizzes] || quizzes["中学生"]
  }

  const generateHachimanQuiz = (spotName: string, difficulty: string) => {
    const quizzes = {
      "小学生": {
        question: `${spotName}は何をお祀りしているでしょう？`,
        options: [
          "神様",
          "お殿様",
          "動物",
          "お花"
        ],
        correct_answer: 0,
        explanation: `${spotName}は八幡神（応神天皇）をお祀りする神社です。`
      },
      "中学生": {
        question: `${spotName}と深い関係がある武将は誰でしょう？`,
        options: [
          "源頼朝",
          "織田信長",
          "豊臣秀吉",
          "徳川家康"
        ],
        correct_answer: 0,
        explanation: `鶴岡八幡宮は源頼朝によって現在の場所に遷され、鎌倉幕府の中心的な神社となりました。`
      },
      "高校生": {
        question: `${spotName}の現在の本宮が建立されたのはいつでしょう？`,
        options: [
          "1828年（文政11年）",
          "1603年（慶長8年）",
          "1467年（応仁元年）",
          "1192年（建久3年）"
        ],
        correct_answer: 0,
        explanation: `現在の本宮は1828年に江戸幕府によって再建されたものです。`
      }
    }
    return quizzes[difficulty as keyof typeof quizzes] || quizzes["中学生"]
  }

  const generateShrineQuiz = (spotName: string, difficulty: string) => {
    return {
      question: `${spotName}のような神社について正しいものはどれでしょう？`,
      options: [
        "地域の守り神をお祀りしている",
        "お寺と同じ宗教です",
        "外国から来た建物です",
        "最近作られた施設です"
      ],
      correct_answer: 0,
      explanation: `神社は日本古来の神道の施設で、地域の守り神や祖先神をお祀りしています。`
    }
  }

  const generateTempleQuiz = (spotName: string, difficulty: string) => {
    return {
      question: `${spotName}のようなお寺について正しいものはどれでしょう？`,
      options: [
        "仏教の教えを学ぶ場所",
        "神道の施設です",
        "商業施設です",
        "政治を行う場所"
      ],
      correct_answer: 0,
      explanation: `お寺は仏教の教えを学び、修行を行う場所です。多くの文化財も保存されています。`
    }
  }

  const generateCastleQuiz = (spotName: string, difficulty: string) => {
    return {
      question: `${spotName}のような城について正しいものはどれでしょう？`,
      options: [
        "戦国武将の居住地だった",
        "一般の人が住んでいた",
        "商業施設だった",
        "宗教施設だった"
      ],
      correct_answer: 0,
      explanation: `城は戦国時代の武将が政治・軍事の拠点として使用していた施設です。`
    }
  }

  const generateGenericQuiz = (spotName: string, difficulty: string) => {
    return {
      question: `${spotName}について正しいものはどれでしょう？`,
      options: [
        "歴史的に重要な場所である",
        "最近作られた観光地である",
        "架空の場所である",
        "海外にある場所である"
      ],
      correct_answer: 0,
      explanation: `${spotName}は長い歴史を持つ重要な文化遺産や史跡です。`
    }
  }

  const getPointsForDifficulty = (difficulty: string): number => {
    const pointsMap: { [key: string]: number } = {
      "小学生": 10,
      "中学生": 15,
      "高校生": 20
    }
    return pointsMap[difficulty] || 10
  }

  const submitAnswer = () => {
    if (selectedAnswer === null || !quiz) return

    const correct = selectedAnswer === quiz.correct_answer
    setIsAnswered(true)
    setIsCorrect(correct)

    if (correct) {
      toast.success(`🎉 正解！ +${quiz.points}ポイント`)
      onScoreUpdate(quiz.points)
    } else {
      toast.error('❌ 不正解... もう一度考えてみよう！')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
        {spot.name}のクイズ
      </h2>

      {!quiz ? (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">{spot.description}</p>
            <p className="text-xs text-gray-500">{spot.address}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              難易度を選択
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="小学生">小学生</option>
              <option value="中学生">中学生</option>
              <option value="高校生">高校生</option>
            </select>
          </div>

          <button
            onClick={generateQuiz}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'クイズを生成中...' : 'クイズに挑戦！'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="font-medium text-gray-900">{quiz.question}</p>
          </div>

          <div className="space-y-2">
            {quiz.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !isAnswered && setSelectedAnswer(index)}
                disabled={isAnswered}
                className={`w-full text-left p-3 rounded-lg border-2 transition ${
                  isAnswered
                    ? index === quiz.correct_answer
                      ? 'border-green-500 bg-green-50'
                      : index === selectedAnswer && !isCorrect
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                    : selectedAnswer === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {isAnswered && index === quiz.correct_answer && (
                    <Check className="h-5 w-5 text-green-600" />
                  )}
                  {isAnswered && index === selectedAnswer && !isCorrect && (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {isAnswered && (
            <div className={`p-4 rounded-lg ${
              isCorrect ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-start space-x-2">
                <AlertCircle className={`h-5 w-5 mt-0.5 ${
                  isCorrect ? 'text-green-600' : 'text-yellow-600'
                }`} />
                <div>
                  <p className={`font-medium ${
                    isCorrect ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {isCorrect ? '正解です！' : 'もう一度考えてみましょう'}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {quiz.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            {!isAnswered ? (
              <button
                onClick={submitAnswer}
                disabled={selectedAnswer === null}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                回答する
              </button>
            ) : (
              <button
                onClick={generateQuiz}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
              >
                新しいクイズ
              </button>
            )}
            
            <button
              onClick={() => {
                setQuiz(null)
                setSelectedAnswer(null)
                setIsAnswered(false)
              }}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  )
}