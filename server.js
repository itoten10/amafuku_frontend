#!/usr/bin/env node

/**
 * Azure App Service用 Next.js起動スクリプト
 */

console.log('🚀 Starting Famoly Drive on Azure App Service...')
console.log('📊 Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  PWD: process.cwd(),
  NODE_VERSION: process.version
})

// Azure App Service環境設定
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

// Next.jsの標準サーバーを起動
const { spawn } = require('child_process')
const port = process.env.PORT || 3000

console.log(`🎯 Starting Next.js server on port ${port}`)

// Next.jsサーバープロセスを起動
const nextServer = spawn('npx', ['next', 'start', '-p', port], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: port
  }
})

// プロセス終了時の処理
nextServer.on('close', (code) => {
  console.log(`Next.js server process exited with code ${code}`)
  process.exit(code)
})

nextServer.on('error', (err) => {
  console.error('Failed to start Next.js server:', err)
  process.exit(1)
})

// シグナルハンドリング
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully')
  nextServer.kill('SIGTERM')
})

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully')
  nextServer.kill('SIGINT')
})