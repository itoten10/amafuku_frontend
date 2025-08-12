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
  // Azure Static Web Apps最適化設定
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  images: {
    unoptimized: true
  },
  // エラーページのカスタマイズ
  generateEtags: false
}

module.exports = nextConfig