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
import ImagePicker from 'react-native-image-picker'


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


false && describe('#287 content provider access issue', (report, done) => {

  Promise.resolve("content://com.rnfetchblobtest.provider/app_images/Pictures/image-c6f94579-a189-44da-9060-3fc9c613f354.jpg")
  .then((result) => {
    console.log(result)
    return fs.readFile(result, 'base64')
  })
  .then((image) => {
    report(<Assert key="can read file" expect={true} actual={true}/>,
  <Info key="image #287">
    <Image style={{width:Dimensions.get('window').width*0.9, height : Dimensions.get('window').width*0.9,margin :16}}
      source={{uri : `data:image/png;base64, ${image}`}}/>
  </Info>)
  })

})

describe('#296 Android Download Manager should not crash the app when status code is not 200', (report, done) => {


  RNFetchBlob.config({
    fileCache : true,
    addAndroidDownloads : {
      useDownloadManager : true,
      title : new Date().toLocaleString() + ' - #236 test.png',
    }
  })
  .fetch('GET', `${TEST_SERVER_URL}/xhr-code/403`)
  .catch((err) => {
    console.log(err)
    report(<Assert key="Download manager throws error"
      actual={true}
      expect={true} />)
    done()
  })
})


describe('#236 removing Android download manager file', (report, done) => {
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
  .then(() => fs.exists(q))
  .then((ex) => {
    report(<Assert key="File should not exists" expect={false} actual={ex}/>)
    done()
  })
  .catch((err) => {
    console.warn(err)
  })
})

false && describe('#321 Android readstream performance', (report, done) => {

  // RNFetchBlob.config({ path : dirs.DCIMDir + '/readStreamtest'})
  // .fetch('GET', `${TEST_SERVER_URL}/public/9mb-5987598452-dummy`)
  // .then((res) => {
  fs.readStream(RNFetchBlob.fs.asset('11mb-json-dummy.json'), 'utf8', 1024000, 250)
  // })
  .then((stream) => {
    let begin = Date.now()
    let data = ''
    stream.open()
    stream.onData((chunk) => {
      console.log('read chunk', chunk.length)
      data += chunk
    })
    stream.onEnd(() => {
      console.log('size of 14mb dummy', data.length)
      console.log(Date.now() - begin, 'ms elapsed')
      console.log(dirs.DocumentDir + '/readStreamtest')
      var d = JSON.parse(data)
      report(<Assert key={`${Date.now() - begin} ms Elapsed`}
        actual={Date.now() - begin < 5000}
        expect={true} />)
      done()
    })
  })

})
