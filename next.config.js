/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://app-002-gen10-step3-2-py-oshima8.azurewebsites.net',
  },
  // デプロイ最適化（swcMinifyはNext.js 15で標準となり非推奨）
  // experimental: {
  //   optimizeCss: true, // crittersモジュール不足のためコメントアウト
  // },
  // 静的エクスポート用（Azure Static Web Appsで必要な場合）
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig