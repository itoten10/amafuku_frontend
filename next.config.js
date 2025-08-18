/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://app-002-gen10-step3-2-py-oshima8.azurewebsites.net',
  },
  // Azure App Service用設定
  images: {
    unoptimized: true
  },
  // Prisma クライアントを外部パッケージとして設定
  serverExternalPackages: ['@prisma/client'],
  // APIルートの設定を明示的に指定
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
    ]
  },
}

module.exports = nextConfig