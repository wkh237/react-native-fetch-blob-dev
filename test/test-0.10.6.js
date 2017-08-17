import RNTest from './react-native-testkit/'
import React from 'react'
import RNFetchBlob from 'react-native-fetch-blob'
import {AppState, AsyncStorage, BackHandler, Dimensions, Image, Linking, Platform, ScrollView, StyleSheet, Text, View,} from 'react-native';

const JSONStream = RNFetchBlob.JSONStream
const fs = RNFetchBlob.fs
const {Assert, Comparer, Info, prop} = RNTest
const describe = RNTest.config({
  group: '0.10.6',
  run: true,
  expand: true,
  timeout: 20000,
})
const {TEST_SERVER_URL, TEST_SERVER_URL_SSL, FILENAME, DROPBOX_TOKEN, styles} = prop()
const dirs = RNFetchBlob.fs.dirs
let prefix = ((Platform.OS === 'android') ? 'file://' : '')
let begin = Date.now()

Platform.OS === 'android' && describe('GetContentIntent should work correctly', (report, done) => {
  let handler = (state) => {
    if(state === 'active') {
      console.log('did not select any file, but all good.')
      AppState.removeEventListener('change', handler)
      done()
    }
  }

  AppState.addEventListener('change', handler)

  RNFetchBlob.android.getContentIntent().then((files) => {
    console.log(files)
    done()
  })
  .catch((err) => {
    report(<Assert key="'GetContentIntent should work correctly (Android)' test should not have failed" expect={null} actual={err}/>)
    done()
  })
})

Platform.OS === 'android' && describe('Downlaod a file and add to Downlaods App (Android)', (report, done) => {
  RNFetchBlob
  .config({path: dirs.DocumentDir+'/github'+new Date()+'.png'})
  .fetch('GET', `${TEST_SERVER_URL}/public/github.png`)
  .then((res) => {
    console.log(res.path())
    return RNFetchBlob.android.addCompleteDownload({
      title: 'test file of RNFB',
      description: 'desc',
      mime: 'image/png',
      path: res.path(),
      showNotification: true
    })
  })
  .then(() => {
    done()
  })
  .catch((err) => {
    report(<Assert key="'Downlaod a file and add to Downlaods App (Android)' test should not have failed" expect={null} actual={err}/>)
    done()
  })
})

false && describe('Cancel task works correctly', (report, done) => {
  let task = RNFetchBlob.fetch('GET', 'http://ipv4.download.thinkbroadband.com/200MB.zip', {})
  let last = -1

  task.progress((current, total) => {
    if(Date.now()-last < 1000)
      return
    last = Date.now()
    console.log((current/total*100).toFixed(2)+'%')
  })

  task.then(() => {
    report(<Assert key="cancel works correctly" expect={true} actual={false}/>)
    done()
  })
  .catch(() => {
    report(<Assert key="cancel works correctly" expect={true} actual={true}/>)
    done()
  })

  setTimeout(() => {
    task.cancel()
  }, 4000)
})


false && describe('#370 upload, cancel, and progress in Fetch replacement', (report, done) => {
  const Fetch = RNFetchBlob.polyfill.Fetch
  // replace built-in fetch
  MyFetch = new Fetch({
    // enable this option so that the response data conversion handled automatically
    auto: true,
    // when receiving response data, the module will match its Content-Type header
    // with strings in this array. If it contains any one of string in this array,
    // the response body will be considered as binary data and the data will be stored
    // in file system instead of in memory.
    // By default, it only store response data to file system when Content-Type
    // contains string `application/octet`.
    binaryContentTypes: [
      'image/',
      'video/',
      'audio/',
      'foo/',
    ]
  }).build()
  const formData = new FormData();
  formData.append('key', '123123');
  formData.append('acl', 'acl=123');
  formData.append('Content-Type', 'formQQ');
  formData.append('X-Amz-Credential', '123');
  formData.append('X-Amz-Algorithm', 'AWS4-HMAC-SHA256');
  formData.append('X-Amz-Date', '123');
  formData.append('Policy', 'base64Policy');
  formData.append('X-Amz-Signature', 'signature');
  formData.append('file', 'file');
  let task = MyFetch(`${TEST_SERVER_URL}/upload-form`, {
    method: 'POST',
    body: formData
  })
  console.log(task)
  task.uploadProgress((current, total) => {
    console.log('upload', current, total)
  })
  task.progress((current, total) => {
    console.log('upload', current, total)
  })
  task.then((res) => {
    return res.json()
  })
  .then((json) => {
    console.log(json)
  })
  .catch((err) => {
    report(<Assert key="#370 test should not have failed" expect={null} actual={err}/>)
    done()
  })
})

describe('inspect memory issue', (report, done) => {
  const batch = () => {
    let promises = []
    for(let i = 0; i < 30; i++) {
      let promise = RNFetchBlob.config({
        fileCache: true
      })
      .fetch('GET', `${TEST_SERVER_URL}/public/github.png`)
      .then((res) => fs.unlink(res.path()))
      promises.push(promise)
    }
    return Promise.all(promises)
  }

  let p = Promise.resolve()
  for(let i = 0; i < 30; i++) {
    p = p.then(() => {
      console.log('sending batch ->', i)
      return batch()
    })
  }
  p.then(() => {
    report(<Assert key="memory test pased" expect={true} actual={true}/>)
    done()
  })
  .catch((err) => {
    report(<Assert key="memory issue test should not have failed" expect={null} actual={err}/>)
    done()
  })
})
