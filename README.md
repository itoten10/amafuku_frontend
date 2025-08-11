# Githubリポジトリの初期化→プッシュまで

## 1. カレントディレクトリをGitリポジトリとして初期化
git init

## 2. ファイルをステージングエリアに追加
git add .

## 3. 初期コミットを作成
git commit -m "Initial commit"

## 4. リモートリポジトリのURLを追加（URLは実際のものに置き換えてください）
git remote add origin your-repository-url

## 5. ローカルのmainブランチをリモートにプッシュ
git push -u origin main


## 環境変数備忘
NODE_ENV:production
PORT:3000


# YAML修正

name: Build and deploy Node.js app to Azure Web App - tech0-gen9-step32-webapp-frontend

on:
  push:
    branches:
      - master
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js version
        uses: actions/setup-node@v3
        with:
          node-version: '20.x'

      - name: npm install, build, and test
      #1
        env:
          NEXT_PUBLIC_API_ENDPOINT: ${{ secrets.NEXT_PUBLIC_API_ENDPOINT }}
        run: |
          npm install
          npm run build --if-present
          npm run test --if-present

      #2
      - name: Copy artifact for deployment job
        run: |
          mkdir deploy
          cp -r ./.next/standalone/. ./deploy
          cp -r ./.next/static/. ./deploy/.next/static

      - name: Zip artifact for deployment
        run: zip release.zip ./deploy -r #3

      - name: Upload artifact for deployment job
        uses: actions/upload-artifact@v4
        with:
          name: node-app
          path: release.zip

  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: 'Production'
      url: ${{ steps.deploy-to-webapp.outputs.webapp-url }}
    
    steps:
      - name: Download artifact from build job
        uses: actions/download-artifact@v4
        with:
          name: node-app

      - name: Unzip artifact for deployment
        run: unzip release.zip
      
      - name: 'Deploy to Azure Web App'
        id: deploy-to-webapp
        uses: azure/webapps-deploy@v3
        with:
          app-name: 'tech0-gen9-step32-webapp-frontend'
          slot-name: 'Production'
          package: ./deploy #4
          publish-profile: ${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE_718598C9C5AF48328C5F64B41696FD40 }}
