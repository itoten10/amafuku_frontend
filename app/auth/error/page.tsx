'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'サーバー設定にエラーがあります。管理者にお問い合わせください。'
      case 'AccessDenied':
        return 'アクセスが拒否されました。'
      case 'Verification':
        return 'トークンの有効期限が切れているか、既に使用されています。'
      case 'OAuthSignin':
        return 'OAuth プロバイダーでサインインできませんでした。'
      case 'OAuthCallback':
        return 'OAuth プロバイダーからのコールバックでエラーが発生しました。'
      case 'OAuthCreateAccount':
        return 'OAuth アカウントの作成に失敗しました。'
      case 'EmailCreateAccount':
        return 'メールアカウントの作成に失敗しました。'
      case 'Callback':
        return 'コールバックでエラーが発生しました。'
      case 'OAuthAccountNotLinked':
        return 'このメールアドレスは別のプロバイダーで既に使用されています。'
      case 'EmailSignin':
        return 'メールの送信に失敗しました。'
      case 'CredentialsSignin':
        return 'サインインに失敗しました。認証情報を確認してください。'
      case 'SessionRequired':
        return 'このページにアクセスするにはサインインが必要です。'
      default:
        return '認証中にエラーが発生しました。もう一度お試しください。'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 bg-red-600 rounded flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          認証エラー
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                {getErrorMessage(error)}
              </p>
            </div>

            {error && (
              <div className="mb-6">
                <p className="text-xs text-gray-500">
                  エラーコード: {error}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Link
                href="/auth/signin"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                サインインページに戻る
              </Link>
              <Link
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                ホームページに戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthError() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  )
}