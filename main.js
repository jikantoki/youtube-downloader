const express = require('express')
const app = express()
const ytdl = require('@distube/ytdl-core')
const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')

app.use(express.static('public'))

const port = 3000

app.listen(port, () => {
  console.log(`Server is Running at ${port}`)
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/download', (req, res) => {
  const url = req.query.url
  const youtubeId = url.slice(-11)

  console.log(`dowmload start! URL = ${url}`)

  ytdl.getBasicInfo(url).then((info) => {
    console.log(info)
  })
  let contentFHD
  const content360p = ytdl(url, { quality: '18' })
    .pipe(fs.createWriteStream(`./files/${youtubeId}_360p.mp4`))
    .on('close', () => {
      console.log('360p and audio Download Complete!')
      contentFHD = ytdl(url)
        .pipe(fs.createWriteStream(`./files/${youtubeId}.mp4`))
        .on('close', () => {
          console.log('Highest Quality Download Complete!')
          execSync(
            `ffmpeg -i ./files/${youtubeId}.mp4 -i ./files/${youtubeId}_360p.mp4 -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 ./files/${youtubeId}_mixed.mp4`
          )
          console.log(`full complete! id = ${youtubeId}`)
          res.download(`./files/${youtubeId}_mixed.mp4`)
        })
    })
})

console.log('OK!!!!')
