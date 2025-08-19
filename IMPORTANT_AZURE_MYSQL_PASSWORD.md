# 重要: Azure MySQL パスワード設定

## ⚠️ パスワードを設定する必要があります

Azure MySQLデータベースに接続するため、以下の手順でパスワードを設定してください：

### 1. Azure Portal での設定

1. [Azure Portal](https://portal.azure.com) にログイン
2. **App Service** `app-002-gen10-step3-2-node-oshima8` を開く
3. **設定** → **環境変数** または **Configuration** をクリック
4. **新しいアプリケーション設定** をクリック
5. 以下を追加：

```
名前: DATABASE_URL
値: mysql://tech0gen10student:実際のパスワード@rdbs-002-gen10-step3-2-oshima8.mysql.database.azure.com:3306/drivingstudy?sslmode=require&sslaccept=strict
```

**重要**: `実際のパスワード` を本当のパスワードに置き換えてください

### 2. パスワードに特殊文字が含まれる場合

URLエンコードが必要です：
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `&` → `%26`
- `=` → `%3D`

例: パスワードが `Pass@word#123` の場合
```
mysql://tech0gen10student:Pass%40word%23123@rdbs-002-gen10-step3-2-oshima8.mysql.database.azure.com:3306/drivingstudy?sslmode=require&sslaccept=strict
```

### 3. 設定後の確認

1. **保存** をクリック
2. **再起動** をクリック
3. アプリケーションにアクセスしてGoogle認証を試す

### 4. 接続できない場合

Azure MySQLのファイアウォール設定を確認：
1. Azure Portal → MySQL サーバー → 接続のセキュリティ
2. **Azure サービスへのアクセスを許可** が有効になっているか確認
3. App ServiceのアウトバウンドIPアドレスを追加

### 5. セキュリティのベストプラクティス

- このファイルは絶対にGitにコミットしない
- パスワードは定期的に変更する
- Azure Key Vaultの使用を検討する