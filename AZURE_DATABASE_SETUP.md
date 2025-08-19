# Azure MySQL Database セットアップ手順

## 1. Azure MySQL接続情報

```
ホスト名: rdbs-002-gen10-step3-2-oshima8.mysql.database.azure.com
ポート: 3306
ユーザー名: tech0gen10student
パスワード: {your-password}
データベース名: drivingstudy
SSL: 必須
```

## 2. Azure App Service環境変数設定

Azure Portal → App Service → 設定 → 環境変数で以下を設定：

```
DATABASE_URL=mysql://tech0gen10student:{your-password}@rdbs-002-gen10-step3-2-oshima8.mysql.database.azure.com:3306/drivingstudy?sslmode=require&sslaccept=strict
```

**重要**: `{your-password}` を実際のパスワードに置き換えてください

## 3. ローカル開発環境でのデータベース初期化

```bash
# 1. Prismaクライアントの生成
npx prisma generate

# 2. データベーススキーマの作成
npx prisma db push

# 3. マイグレーションの作成（本番環境用）
npx prisma migrate dev --name init
```

## 4. Azure上でのデータベース初期化

GitHub Actionsでのデプロイ時に自動実行されるように設定済み：
- `prisma generate` 
- `prisma db push`

## 5. 接続テスト

```bash
# Prisma Studioで接続確認
npx prisma studio
```

## 6. トラブルシューティング

### SSL接続エラーの場合
DATABASE_URLに以下のパラメータを追加：
```
?sslmode=require&sslaccept=strict&sslcert=/path/to/cert
```

### タイムアウトエラーの場合
- Azure MySQLのファイアウォール設定を確認
- Azure App ServiceのアウトバウンドIPアドレスを許可リストに追加

### 認証エラーの場合
- パスワードに特殊文字が含まれる場合はURLエンコードが必要
- 例: `@` → `%40`, `#` → `%23`

## 7. データベース管理コマンド

```bash
# スキーマの同期
npx prisma db push

# マイグレーション状態の確認
npx prisma migrate status

# データベースリセット（開発環境のみ）
npx prisma migrate reset
```

## 8. セキュリティ注意事項

- DATABASE_URLは絶対にGitにコミットしない
- Azure Key Vaultの使用を検討
- 定期的なパスワードローテーション
- 最小権限の原則に従ったユーザー権限設定