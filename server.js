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

// nextコマンドの実行パスを明示的に指定（Azureのシンボリックリンク対応）
const possiblePaths = [
  path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next'),
  path.join('/node_modules', 'next', 'dist', 'bin', 'next'),
  path.join(__dirname, '_del_node_modules', 'next', 'dist', 'bin', 'next')
];

// 存在するパスを見つける
let nextPath = null;
for (const p of possiblePaths) {
  try {
    if (require('fs').existsSync(p)) {
      nextPath = p;
      console.log(`✅ Found Next.js at: ${p}`);
      break;
    }
  } catch (e) {
    // Continue to next path
  }
}

if (!nextPath) {
  console.error('❌ Could not find Next.js binary!');
  console.error('Searched paths:', possiblePaths);
  process.exit(1);
}

// nextコマンドを実行
const nextProcess = spawn('node', [nextPath, 'start', '-p', port], {
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