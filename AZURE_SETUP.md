# Azure環境変数設定手順

## Azure App Serviceで環境変数を設定する方法

1. **Azure Portal**にアクセス
2. **App Service** `app-002-gen10-step3-2-node-oshima8` を選択
3. **設定** → **環境変数** または **Configuration** を選択
4. **アプリケーション設定**で以下を追加：

### 必要な環境変数

```
名前: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
値: AIzaSyBRmDlXpXGPfyVtzmXX6-8dP2_vDCvTJKA

名前: NEXT_PUBLIC_API_URL
値: https://app-002-gen10-step3-2-py-oshima8.azurewebsites.net
```

5. **保存**をクリック
6. **再起動**をクリック

## 設定確認方法

ブラウザの開発者ツール（F12）のコンソールで以下が表示されるかチェック：

```
🗺️ Google Maps API Debug:
API Key exists: true
API Key preview: AIzaSyBRmD...
Has valid API key: true
Maps available: true
```

## Google Cloud Console設定確認

Google Maps APIが有効化されているかチェック：
1. [Google Cloud Console](https://console.cloud.google.com/)
2. **APIとサービス** → **有効なAPI**
3. 以下のAPIが有効になっているかチェック：
   - Maps JavaScript API
   - Places API  
   - Directions API
   - Geocoding API

## ドメイン設定

Google Cloud Consoleで以下のドメインを許可：
- `https://app-002-gen10-step3-2-node-oshima8.azurewebsites.net`
- `localhost:3000` （開発用）

## Google OAuth 設定（重要！）

**redirect_uri_mismatchエラー**を解決するため、Google Cloud Console で OAuth 2.0 クライアントID を設定：

### 1. Google Cloud Console → 認証情報 → OAuth 2.0 クライアント ID

### 2. 承認済みリダイレクトURI に追加:
```
https://app-002-gen10-step3-2-node-oshima8.azurewebsites.net/api/auth/callback/google
```

### 3. 承認済みJavaScript生成元 に追加:
```  
https://app-002-gen10-step3-2-node-oshima8.azurewebsites.net
```

### 4. NextAuth用環境変数をAzure App Serviceに設定:
```
名前: NEXTAUTH_URL
値: https://app-002-gen10-step3-2-node-oshima8.azurewebsites.net

名前: NEXTAUTH_SECRET  
値: (32文字以上のランダム文字列)

名前: AUTH_GOOGLE_ID
値: (Google OAuth Client ID)

名前: AUTH_GOOGLE_SECRET
値: (Google OAuth Client Secret)
```