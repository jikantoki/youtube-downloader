const fs = require('fs')
const ytdl = require('@distube/ytdl-core')
const { execSync } = require('child_process')

const BASE_PATH = `https://www.youtube.com/watch?v=`

const youtubeId = `cuk6qQBJm7Y` //DLするYoutube動画のID（urlのv=の後ろの部分11桁）
const url = BASE_PATH + youtubeId

console.log('dowmload start!')

ytdl.getBasicInfo(url).then((info) => {
  console.log(info)
})
let contentFHD
const content360p = ytdl(url, { quality: '18' })
  .pipe(fs.createWriteStream(`${youtubeId}_360p.mp4`))
  .on('close', () => {
    console.log('360p and audio Download Complete!')
    contentFHD = ytdl(url)
      .pipe(fs.createWriteStream(`${youtubeId}.mp4`))
      .on('close', () => {
        console.log('Highest Quality Download Complete!')
        execSync(
          `ffmpeg -i ${youtubeId}.mp4 -i ${youtubeId}_360p.mp4 -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 ${youtubeId}_mixed.mp4`
        )
        console.log(`full complete! id = ${youtubeId}`)
      })
  })
