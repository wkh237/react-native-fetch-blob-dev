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
  CameraRoll,
  AsyncStorage,
  Image,
} from 'react-native';

window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = RNFetchBlob.polyfill.Blob

const JSONStream = RNFetchBlob.JSONStream
const fs = RNFetchBlob.fs
const { Assert, Comparer, Info, prop } = RNTest
const describe = RNTest.config({
  group : '0.10.3',
  run : true,
  expand : false,
  timeout : 20000,
})
const { TEST_SERVER_URL, TEST_SERVER_URL_SSL, FILENAME, DROPBOX_TOKEN, styles } = prop()
const dirs = RNFetchBlob.fs.dirs
let prefix = ((Platform.OS === 'android') ? 'file://' : '')
let begin = Date.now()

// describe('#230 #249 cookies manipulation', (report, done) => {
//
//   RNFetchBlob
//   .fetch('GET', `${TEST_SERVER_URL}/cookie/249230`)
//   .then((res) => RNFetchBlob.net.getCookies(`${TEST_SERVER_URL}`))
//   .then((cookies) => {
//     console.log(cookies)
//     report(<Assert
//       key="should set 10 cookies"
//       expect={10}
//       actual={cookies.length}/>)
//     return RNFetchBlob.fetch('GET', `${TEST_SERVER_URL}/cookie-echo`)
//   })
//   .then((res) => {
//     console.log('##',res.data)
//     let cookies = String(res.data).split(';')
//     report(<Assert
//       key="should send 10 cookies"
//       expect={10}
//       actual={cookies.length}/>)
//     return RNFetchBlob.net.removeCookies(`${TEST_SERVER_URL}`)
//   })
//   .then(() => RNFetchBlob.net.getCookies('localhost'))
//   .then((cookies) => {
//     report(<Assert
//       key="should have no cookies"
//       expect={undefined}
//       actual={cookies['localhost']}/>)
//     return RNFetchBlob.fetch('GET', `${TEST_SERVER_URL}/cookie-echo`)
//   })
//   .then((res) => {
//     console.log(res.data)
//     let cookies = String(res.data).split(';')
//     cookies = _.reject(cookies, r => r.length < 2)
//     report(<Assert
//       key="should send no cookies"
//       expect={0}
//       actual={cookies.length}/>)
//     done()
//   })
//   .catch((err) => {
//     report(<Assert key="'#230 #249 cookies manipulation' test should not have failed" expect={null} actual={err}/>)
//     done()
//   })
// })

// describe('#254 IOS fs.stat lastModified date correction', (report, done) => {
//
//   let path = dirs.DocumentDir + '/temp' + Date.now()
//   fs.createFile(path, 'hello', 'utf8' )
//     .then(() => fs.stat(path))
//     .then((stat) => {
//       console.log(stat)
//       let p = stat.lastModified / Date.now()
//       report(<Assert key="date is correct" expect={true} actual={ p< 1.05 && p > 0.95}/>)
//       done()
//     })
//
// })
//
// describe('#263 parallel request', (report, done) => {
//   let urls = [
//     `${TEST_SERVER_URL}/public/1mb-dummy`,
//     `${TEST_SERVER_URL}/public/2mb-dummy`,
//     `${TEST_SERVER_URL}/public/404`
//   ]
//   let size = [1000000, 1310720, 23]
//   let asserts = []
//   new Promise
//   .all(urls.map((url) => RNFetchBlob.fetch('GET', url)))
//   .then((results) => {
//     _.each(results, (r, i) => {
//       report(
//         <Assert key={`redirect URL ${i} should be correct`}
//           expect={urls[i]}
//           actual={r.info().redirects[0]}/>)
//       report(<Assert key={`content ${i} should be correct`}
//         expect={size[i]}
//         actual={r.data.length}/>)
//     })
//     done()
//   })
//
// })
//
// describe('#264 network exceptions should be catchable', (report, done) => {
//
//   let task = RNFetchBlob
//   .config({ fileCache : true})
//   .fetch('GET',`${TEST_SERVER_URL}/interrupt`)
//   task
//   .then((res) => {
//     console.log(res.data)
//     console.log(res.info())
//   })
//   .catch((err) => {
//     report(<Assert key="server error should be catchable" expect={true} actual={true}/>)
//     done()
//   })
//
// })
//
// describe('readstream with empty buffer', (report, done) => {
//
//   let data = { cool : 100 }
//   let path = dirs.DocumentDir + '/test' + Date.now()
//   let result = ''
//
//   fs.writeFile(path, JSON.stringify(data), 'utf8')
//     .then(() => fs.readStream(path, 'utf8'))
//     .then((stream) => {
//       stream.open()
//       stream.onData((chunk) => { result += chunk })
//       stream.onError((err) => console.log('err' + err))
//       stream.onEnd(() => {
//         report(<Assert key="content size should be correct" expect={12} actual={result.length}/>)
//         done()
//       })
//     })
//
// })
//
// describe('#266 IOS readFile crashes the app', (report, done) => {
//
//   CameraRoll.getPhotos({first : 10})
//     .then((resp) => {
//       let url = resp.edges[0].node.image.uri
//       console.log('CameraRoll',url+'123')
//       fs
//       .readFile('assets-library://asset/asset.JPG?id=83C135B6-A77C-4752-B868-6BDA7183ADE7123&ext=JPG', 'base64')
//       .then((data) => {
//         report(<Assert key="error should be catchable" expect={true} actual={false}/>)
//       })
//       .catch((err) => {
//         report(<Assert key="error should be catchable" expect={true} actual={true}/>)
//         done()
//       })
//     })
//
// })

// describe('#268 HTTPS requests could not be canceled', (report, done) => {
//   let task = RNFetchBlob.config({
//     fileCache : true
//   })
//   .fetch('GET', `https://rnfb-test-app.firebaseapp.com/cat.JPG`)
//   task.progress((now, total) => {
//     console.log(now, total)
//   })
//   task.cancel()
//   task.then(() => {
//     report(<Assert key="request should not success" expect={false} actual={true}/>)
//     done()
//   })
//   .catch(() => {
//     report(<Assert key="request should not success" expect={true} actual={true}/>)
//     done()
//   })
// })

describe('#293 the content type encoding suffix should be stripped', (report, done) => {
  let run = function(ctype, val) {
    return new Promise((resolve, reject) => {
      let header = {}
      header[ctype] = val
      let task = RNFetchBlob.fetch('GET', `${TEST_SERVER_URL}/public/github.png`)
      .then((res) => {
        return RNFetchBlob.fetch('PUT', `${TEST_SERVER_URL}/xhr-header`, header,ctype, res.data)
      })
      .then((res) => {
        console.log(ctype, val, res.json())
        report(<Assert key={`${ctype + val} srtipes correctly`} expect="image/png" actual={res.json()['content-type']}/>)
        resolve()
      })
    })
  }

  Promise.all([
    run('Content-Type', 'image/png;base64'),
    run('Content-Type', 'image/png;BASE64'),
    run('content-type', 'image/png;base64'),
    run('content-type', 'image/png;BASE64')
  ])
  .then(() => done())
  .catch((err) => {
    report(<Assert key="'#293 the content type encoding suffix should be stripped' test should not have failed" expect={null} actual={err}/>)
    done()
  })
})
