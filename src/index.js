// This code tries to replicate a bug on chrome that omits range request header
// when first going to the cache for xhr binary requests.
const get = require('simple-get')

const TOTAL_SIZE = 7608204
const PIECE_SIZE = 50000
const FILE_URL = 'https://arxivum-webseed.bertofer.me/74fc639b-2a18-4770-a52f-733504b18168.enc'

function onResponse (err, res, data) {
  if (err) console.log(err)
  console.log(res)
  console.log(data)
}

let current_start = 0

var interval = window.setInterval(function () {
  let end = current_start + PIECE_SIZE
  if (end > TOTAL_SIZE) end = TOTAL_SIZE - 1

  const opts = {
    url: FILE_URL,
    method: 'GET',
    headers: {
      range: 'bytes=' + current_start + '-' + end
    }
  }

  get.concat(opts, onResponse)
  current_start = end + 1

  if (current_start >= TOTAL_SIZE) window.clearInterval(interval)
}, 100)
