import RNTest from './react-native-testkit/'
import React from 'react'
import _ from 'lodash'
import RNFetchBlob from 'react-native-fetch-blob'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Linking,
  Platform,
  Dimensions,
  BackAndroid,
  AsyncStorage,
  Image,
} from 'react-native';


const JSONStream = RNFetchBlob.JSONStream
const fs = RNFetchBlob.fs
const { Assert, Comparer, Info, prop } = RNTest
const describe = RNTest.config({
  group : '0.10.5',
  run : true,
  expand : true,
  timeout : 20000,
})
const { TEST_SERVER_URL, TEST_SERVER_URL_SSL, FILENAME, DROPBOX_TOKEN, styles } = prop()
const dirs = RNFetchBlob.fs.dirs
let prefix = ((Platform.OS === 'android') ? 'file://' : '')
let begin = Date.now()


false && describe('#236 removing Android download manager file', (report, done) => {
  let q = fs.dirs.DCIMDir + '/' + new Date().getTime() + '-test.png'
  console.log('download to', q)
  RNFetchBlob.config({
    addAndroidDownloads : {
      useDownloadManager : true,
      title : new Date().toLocaleString() + ' - #236 test.png',
      path : q
    }
  })
  .fetch('GET', `${TEST_SERVER_URL}/public/github.png`)
  .then((res) => {
    console.log('removing file', q)
    return fs.unlink(q)
  })
  .then((ex) => {
    console.log('file deleted')
    done()
  })
  .catch((err) => {
    console.warn(err)
  })
})

describe('#321 Android readstream performance', (report, done) => {

  RNFetchBlob.config({ path : dirs.DCIMDir + '/readStreamtest'})
  .fetch('GET', `${TEST_SERVER_URL}/public/9mb-5987598452-dummy`)
  .then((res) => {
    return fs.readStream(res.path(), 'utf8', 1024000, 250)
  })
  .then((stream) => {
    let begin = Date.now()
    let data = ''
    stream.open()
    stream.onData((chunk) => {
      console.log('read chunk', chunk.length)
      data += chunk
    })
    stream.onEnd(() => {
      console.log('size of 9mb dummy', data.length)
      console.log(Date.now() - begin, 'ms elapsed')
      console.log(dirs.DocumentDir + '/readStreamtest')
      console.log(data.substr(data.length-10, data.length), '5987598452')
      report(<Assert key={`${Date.now() - begin} ms Elapsed`}
        actual={Date.now() - begin < 5000}
        expect={true} />)
      done()
    })
  })

})
