# 🚗 Famoly Drive Frontend

## 概要

Famoly Drive（家族向け教育ドライブアプリ）のフロントエンドアプリケーション。
家族でドライブ中に歴史を学べる教育プラットフォームを提供します。

## 主な機能

- 🗺️ **教育強化ルート検索**: 目的地までの経路に沿って歴史スポットを自動検出
- 📍 **地理的分散ロジック**: ルートを10区間に分割して均等にスポット配置
- 🤖 **AIクイズ生成**: OpenAI APIを使用した動的クイズ作成
- 📊 **スコア管理**: 学習進度とランキング表示
- 🎯 **難易度調整**: 小学生・中学生・高校生レベル対応

## 技術スタック

- **Framework**: Next.js 15 + TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Google Maps JavaScript API
- **State Management**: React hooks
- **Notifications**: react-hot-toast
- **Icons**: Lucide React

## 環境構築

### 依存関係インストール
```bash
npm install
```

### 環境変数設定
```bash
cp .env.example .env.local
```

`.env.local` に以下を設定：
```
NEXT_PUBLIC_API_URL=https://app-002-gen10-step3-2-py-oshima8.azurewebsites.net
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 開発サーバー起動
```bash
npm run dev
```

アプリケーションが `http://localhost:3001` で起動します。

## デプロイ（Azure Static Web Apps）

### 環境変数
```
NEXT_PUBLIC_API_URL=https://app-002-gen10-step3-2-py-oshima8.azurewebsites.net
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### ビルド設定
- **Build command**: `npm run build`
- **Output location**: `out/`
- **Node.js version**: 18.x

## 主要コンポーネント

### 🗺️ 地図コンポーネント
- `EnhancedGoogleMapRoute.tsx`: Google Maps統合版
- `EnhancedSampleMapRoute.tsx`: サンプルモード版

### 🎯 クイズシステム
- `AIQuizPanel.tsx`: OpenAI統合クイズ生成
- `WorkingQuizPanel.tsx`: 基本クイズ機能

## 地理的分散アルゴリズム

1. **ルート分割**: 経路を10等分区間に分割
2. **区間別検索**: 各区間8km圏内で歴史スポット検索
3. **教育価値評価**: 国宝・重要文化財を優先
4. **重複排除**: 最小1km間隔での分散配置

## サンプルルート

- **東京駅 → 鎌倉駅**: 鎌倉大仏、鶴岡八幡宮、建長寺
- **東京 → 京都**: 清水寺、金閣寺、伏見稲荷大社
- **その他**: 浅草寺、明治神宮、東京国立博物館

## 🎉 デプロイ状況

### バックエンド: **デプロイ完了** ✅
- **URL**: https://app-002-gen10-step3-2-py-oshima8.azurewebsites.net  
- **OpenAI統合**: 完全動作確認済み
- **AIクイズ生成**: テスト成功
- **API応答**: 正常稼働中

### フロントエンド: **デプロイ準備完了** 🚀
このフロントエンドはAzure Static Web Apps環境でのデプロイ用に最適化されています。

---

## 🔄 バックアップ情報
以前の顧客管理フロントエンドは `backup-customer-frontend` ブランチに保存されています。# Test Azure tar.gz disable - 2025年 8月19日 火曜日 01時32分54秒 JST
