/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://app-002-gen10-step3-2-py-oshima8.azurewebsites.net',
  },
  // Azure App Service用設定
  // 通常のNext.jsサーバーモードを使用（より安定）
  // 画像最適化は無効のまま（Azure App Service制限対応）
  images: {
    unoptimized: true
  },
  // エラーページの改善
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  }
}

module.exports = nextConfig