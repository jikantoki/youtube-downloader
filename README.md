# YouTube Downloader

YouTube 動画をダウンロードできる Web サイト

![Screenshot](./screenshot.png)

## Install

```shell
yarn install
```

### 使用するポートを選択

/.env.js を作り以下を記述

```js
export default {
  port: 3000, //使用したいポート（迷ったら3000でいいよ）
}
```

## How to use

クリックするだけで動かす(Windows Only)

1. /run.bat をダブルクリック
2. これで動きます！

コマンド叩いて起動する方法

```shell
node main.js
#Webサイトが立ち上がるので http://localhost:3000 にアクセス
```

## 既知の問題

- 存在しない動画の URL でダウンロードを開始すると、プログラムが強制終了します

## デプロイ方法

正直どうやるかわからん  
cron で以下のコード打つとか？（アホ）

```shell
while true
do
  node main.js
done
```
