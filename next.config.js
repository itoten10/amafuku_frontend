/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://app-002-gen10-step3-2-py-oshima8.azurewebsites.net',
  },
  // Azure App Service用設定（サーバーサイドレンダリング対応）
  // output: 'export' を削除してスタンドアロンモードを有効化
  output: 'standalone',
  // 画像最適化は無効のまま（Azure App Service制限対応）
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig