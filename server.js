#!/usr/bin/env node

/**
 * Azure App Service用のNext.jsサーバー起動スクリプト
 * APIルートが確実に動作するよう設定
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// 開発モードかどうか
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// ポート設定 - Azure App Service用に8080をデフォルトに
const port = process.env.PORT || 8080;

console.log('🚀 Starting Famoly Drive Next.js server...');
console.log(`📦 Current directory: ${process.cwd()}`);
console.log(`🔌 Port: ${port}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV}`);

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    
    // デバッグログ
    if (parsedUrl.pathname.startsWith('/api/')) {
      console.log(`🔗 API request: ${req.method} ${parsedUrl.pathname}`);
    }
    
    handle(req, res, parsedUrl);
  });

  server.listen(port, '0.0.0.0', (err) => {
    if (err) {
      console.error('❌ Server startup error:', err);
      throw err;
    }
    
    console.log('✅ Next.js server started successfully');
    console.log(`🌐 Server listening on http://0.0.0.0:${port}`);
    console.log('🔗 API routes should be available at:');
    console.log(`   - http://0.0.0.0:${port}/api/health`);
    console.log(`   - http://0.0.0.0:${port}/api/auth/signin`);
    console.log(`   - http://0.0.0.0:${port}/api/auth/[...nextauth]`);
  });
}).catch((err) => {
  console.error('❌ Next.js app preparation failed:', err);
  process.exit(1);
});