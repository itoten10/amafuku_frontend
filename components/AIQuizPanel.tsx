'use client'

import { useState } from 'react'
import { BookOpen, Check, X, AlertCircle, Sparkles, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

interface HistoricalSpot {
  place_id: string
  name: string
  address: string
  lat: number
  lng: number
  description: string
}

interface AIQuiz {
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  points: number
}

interface AIQuizPanelProps {
  spot: HistoricalSpot
  onScoreUpdate: (points: number) => void
}

export function AIQuizPanel({ spot, onScoreUpdate }: AIQuizPanelProps) {
  const [quiz, setQuiz] = useState<AIQuiz | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [loading, setLoading] = useState(false)
  const [difficulty, setDifficulty] = useState('中学生')
  const [generatedBy, setGeneratedBy] = useState<'openai' | 'fallback'>('openai')

  const generateAIQuiz = async () => {
    setLoading(true)

    try {
      // バックエンドのOpenAI APIエンドポイントを呼び出し（本番環境対応）
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://app-002-gen10-step3-2-py-oshima8.azurewebsites.net'
      const response = await fetch(`${API_BASE_URL}/api/v1/quizzes/generate-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spot_name: spot.name,
          spot_description: spot.description,
          difficulty: difficulty
        })
      })

      if (!response.ok) {
        throw new Error('クイズ生成に失敗しました')
      }

      const data = await response.json()
      
      if (data.success && data.quiz) {
        setQuiz(data.quiz)
        setGeneratedBy(data.generated_by)
        setSelectedAnswer(null)
        setIsAnswered(false)
        setIsCorrect(false)
        
        const method = data.generated_by === 'openai' ? 'AI生成' : '📚 固定データ'
        toast.success(`${method}クイズを作成しました！`)
      } else {
        throw new Error('クイズデータの取得に失敗しました')
      }

    } catch (error) {
      console.error('AI Quiz generation error:', error)
      
      // より詳細なエラーメッセージ
      let errorMessage = 'クイズ生成に失敗しました。'
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'バックエンドサーバーに接続できません。サーバーが起動しているか確認してください。'
        } else if (error.message.includes('NetworkError')) {
          errorMessage = 'ネットワークエラーが発生しました。'
        }
      }
      
      toast.error(errorMessage)
      console.log('API_BASE_URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
    } finally {
      setLoading(false)
    }
  }

  const submitAnswer = () => {
    if (selectedAnswer === null || !quiz) return

    const correct = selectedAnswer === quiz.correct_answer
    setIsAnswered(true)
    setIsCorrect(correct)

    if (correct) {
      const bonusMultiplier = generatedBy === 'openai' ? 1.5 : 1 // AI生成クイズにはボーナス
      const finalPoints = Math.floor(quiz.points * bonusMultiplier)
      toast.success(`🎉 正解！ +${finalPoints}ポイント ${generatedBy === 'openai' ? '(AI生成ボーナス!)' : ''}`)
      onScoreUpdate(finalPoints)
    } else {
      toast.error('❌ 不正解... もう一度考えてみよう！')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <BookOpen className="h-5 w-5 mr-2 text-red-600" />
        {spot.name}のAIクイズ
        {generatedBy === 'openai' && (
          <Sparkles className="h-4 w-4 ml-2 text-yellow-500" />
        )}
      </h2>

      {!quiz ? (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">{spot.description}</p>
            <p className="text-xs text-gray-500">{spot.address}</p>
          </div>

          {/* AI機能の説明 */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-center">
              <Zap className="h-5 w-5 text-red-600 mr-2" />
              <span className="font-medium text-gray-800">各スポットのクイズを自動生成！AIクイズでは1.5倍ボーナス！</span>
            </div>
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
              <option value="小学生">小学生 (10pt)</option>
              <option value="中学生">中学生 (15pt)</option>
              <option value="高校生">高校生 (20pt)</option>
            </select>
          </div>

          <button
            onClick={generateAIQuiz}
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                AIクイズ生成中...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                AIクイズに挑戦！
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 生成方式の表示 */}
          <div className={`p-2 rounded-lg text-sm flex items-center ${
            generatedBy === 'openai' 
              ? 'bg-gray-100 text-gray-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {generatedBy === 'openai' ? (
              <>
                <Sparkles className="h-4 w-4 mr-1" />
                AI生成クイズ (1.5倍ボーナス)
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 mr-1" />
                固定クイズ (通常ポイント)
              </>
            )}
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
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
                      ? 'border-gray-400 bg-gray-50'
                      : index === selectedAnswer && !isCorrect
                      ? 'border-gray-500 bg-gray-50'
                      : 'border-gray-200 bg-gray-50'
                    : selectedAnswer === index
                    ? 'border-gray-500 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {isAnswered && index === quiz.correct_answer && (
                    <Check className="h-5 w-5 text-gray-600" />
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
              isCorrect ? 'bg-gray-50 border border-gray-200' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-start space-x-2">
                <AlertCircle className={`h-5 w-5 mt-0.5 ${
                  isCorrect ? 'text-gray-600' : 'text-yellow-600'
                }`} />
                <div>
                  <p className={`font-medium ${
                    isCorrect ? 'text-gray-800' : 'text-yellow-800'
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
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                回答する
              </button>
            ) : (
              <button
                onClick={generateAIQuiz}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition"
              >
                新しいAIクイズ
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