# Azure App Service 環境変数設定ガイド

## 設定する場所
**Frontend側** (app-002-gen10-step3-2-node-oshima8) のApp Serviceに設定

## 設定手順

1. [Azure Portal](https://portal.azure.com) にログイン
2. **App Service** `app-002-gen10-step3-2-node-oshima8` を開く
3. **設定** → **環境変数** または **Configuration** をクリック
4. 以下の環境変数を追加

## 必要な環境変数一覧

### 1. DATABASE_URL (最重要)
```
名前: DATABASE_URL
値: mysql://tech0gen10student:vY7JZNfU@rdbs-002-gen10-step3-2-oshima8.mysql.database.azure.com:3306/drivingstudy?ssl={"ca":"/home/site/wwwroot/DigiCertGlobalRootCA.crt.pem"}
```

### 2. NextAuth関連
```
名前: NEXTAUTH_URL
値: https://app-002-gen10-step3-2-node-oshima8.azurewebsites.net

名前: NEXTAUTH_SECRET
値: [32文字以上のランダムな文字列を生成して設定]
```

### 3. Google OAuth
```
名前: AUTH_GOOGLE_ID
値: [Google Cloud ConsoleのOAuth 2.0クライアントIDから取得]

名前: AUTH_GOOGLE_SECRET
値: [Google Cloud ConsoleのOAuth 2.0クライアントシークレットから取得]
```

### 4. Google Maps API
```
名前: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
値: AIzaSyBRmDlXpXGPfyVtzmXX6-8dP2_vDCvTJKA
```

### 5. バックエンドAPI URL
```
名前: NEXT_PUBLIC_API_URL
値: https://app-002-gen10-step3-2-py-oshima8.azurewebsites.net
```

### 6. Node環境
```
名前: NODE_ENV
値: production
```

## 設定後の手順

1. すべての環境変数を追加したら **保存** をクリック
2. **再起動** をクリックしてApp Serviceを再起動
3. 再起動完了後、アプリケーションにアクセス
4. Google認証でログインをテスト

## トラブルシューティング

### SSL証明書エラーの場合
- DigiCertGlobalRootCA.crt.pemファイルが正しくデプロイされているか確認
- DATABASE_URLのSSL設定パスを確認

### データベース接続エラーの場合
1. Azure MySQLのファイアウォール設定を確認
2. 「Azure サービスへのアクセスを許可」が有効になっているか確認
3. パスワードが正しいか確認（vY7JZNfU）

### 認証エラーの場合
- NEXTAUTH_URLが正しく設定されているか確認
- Google Cloud ConsoleでリダイレクトURIが設定されているか確認

## 確認方法

Kuduコンソール（https://app-002-gen10-step3-2-node-oshima8.scm.azurewebsites.net/Env）で環境変数が正しく設定されているか確認できます。