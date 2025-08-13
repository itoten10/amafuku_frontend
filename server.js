#!/usr/bin/env node

/**
 * Azure App Service用のシンプルなNext.jsサーバー起動スクリプト
 * nextコマンドが見つからない問題を回避
 */

const { spawn } = require('child_process');
const path = require('path');

// ポート設定（Azure環境変数またはデフォルト）
const port = process.env.PORT || 3000;

console.log('🚀 Starting Famoly Drive Next.js server...');
console.log(`📦 Current directory: ${process.cwd()}`);
console.log(`🔌 Port: ${port}`);

// nextコマンドの実行パスを明示的に指定
const nextBin = path.join(__dirname, 'node_modules', '.bin', 'next');
const nextFallback = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');

// nextコマンドを実行
const nextProcess = spawn('node', [nextFallback, 'start', '-p', port], {
  stdio: 'inherit',
  env: { ...process.env, PORT: port }
});

nextProcess.on('error', (err) => {
  console.error('❌ Failed to start Next.js server:', err);
  process.exit(1);
});

nextProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Next.js server exited with code ${code}`);
  }
  process.exit(code);
});

// グレースフルシャットダウン
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM received, shutting down gracefully...');
  nextProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('⚠️ SIGINT received, shutting down gracefully...');
  nextProcess.kill('SIGINT');
});