const express = require('express')
const app = express()
const ytdl = require('@distube/ytdl-core')
const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')

/** ファイルを削除 */
const deleteFile = (filePath) => {
  try {
    fs.unlinkSync(filePath)
    return true
  } catch (err) {
    console.log(err)
    return false
  }
}

/**
 * 特殊文字の置き換え
 * @params String str
 */
const replaceSpecialWords = (str) => {
  str = str.replaceAll('/', '-')
  str = str.replaceAll('\\', '-')
  str = str.replaceAll('|', '-')
  str = str.replaceAll('?', '-')
  str = str.replaceAll('*', '-')
  str = str.replaceAll(':', '-')
  str = str.replaceAll('"', '-')
  str = str.replaceAll("'", '-')
  return str
}

app.use(express.static('public'))

const port = 3000

app.listen(port, () => {
  console.log(`Server is Running at ${port}`)
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('info', (req, res) => {
  const url = req.query.url
  console.log(url)
  res.send('あw')
})

app
  .get('/download', (req, res) => {
    //getパラメータから落としたい動画のURL取得
    let url = req.query.url
    try {
      new URL(url)
    } catch (error) {
      res.send(`Invalid URL: ${url}`)
      console.log(`認識できないURL by new URL: ${url}`)
      return
    }

    //プレイリストだとバグるので単体の動画にする
    const urlObject = new URL(url)
    const urlParams = urlObject.searchParams
    urlParams.delete('list')
    url = urlObject.href
    const youtubeId = url.slice(-11)

    //www.youtube.comをyoutu.beに変換
    if (
      urlObject.host == 'www.youtube.com' ||
      urlObject.host == 'youtube.com'
    ) {
      const videoId = urlParams.get('v')
      if (videoId && videoId != '') {
        url = `https://youtu.be/${videoId}`
      }
    }

    console.log(`ダウンロード開始 URL = ${url}`)

    if (!ytdl.validateID(youtubeId) && !ytdl.validateURL(url)) {
      res.send(`Invalid URL: ${url}`)
      console.log(`認識できないURL by ytdl.validate: ${url}`)
      return
    }

    //youtube.com又はyoutu.beドメインのURLかつ再生できない動画の時に
    //メインプログラムごと止まってしまうバグあり
    ytdl.getInfo(url).then((info) => {
      const details = info.player_response.videoDetails
      const title = details.title
      const author = details.author
      const filename = replaceSpecialWords(
        `${author} - ${title} (${youtubeId})`
      )
      console.log(`ダウンロード中: ${filename}.mp4`)
      //360p音声付きダウンロード
      ytdl(url, { quality: '18' })
        .pipe(fs.createWriteStream(`./files/${youtubeId}_360p.mp4`))
        .on('error', () => {
          res.send('ダウンロード失敗')
          console.log('360p動画のダウンロードに失敗')
          return
        })
        .on('close', () => {
          console.log('360p音声付き動画をダウンロードしました！')
          setTimeout(() => {
            console.log(
              '60秒経ってもHD画質がダウンロードできなかったので、360p動画を送信します'
            )
            res.download(
              `./files/${youtubeId}_360p.mp4`,
              `${filename}_360p.mp4`
            )
          }, 60 * 1000)
          //最高画質、音声なしダウンロード
          ytdl(url)
            .pipe(fs.createWriteStream(`./files/${youtubeId}.mp4`))
            .on('close', () => {
              console.log('最高画質（音声なし）をダウンロードしました！')
              //ダウンロードした2つの動画を結合
              execSync(
                `ffmpeg -i ./files/${youtubeId}.mp4 -i ./files/${youtubeId}_360p.mp4 -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 ./files/${youtubeId}_mixed.mp4`
              )
              console.log(`二つの動画を結合しました！`)
              deleteFile(`./files/${youtubeId}.mp4`)
              deleteFile(`./files/${youtubeId}_360p.mp4`)
              console.log('結合前の動画を削除しました！')
              res.download(`./files/${youtubeId}_mixed.mp4`, `${filename}.mp4`)
              console.log(`クライアント端末に送信しました！: ${filename}.mp4`)
            })
        })
    })
  })
  .on('error', () => {
    res.send('Video not found')
    return
  })
