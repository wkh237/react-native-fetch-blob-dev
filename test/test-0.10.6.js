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
  BackHandler,
  AsyncStorage,
  AppState,
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

Platform.OS === 'android' &&
describe('GetContentIntent should work correctly', (report, done) => {
  let handler = (state) =>{
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

})

Platform.OS === 'android' &&
describe('Downlaod a file and add to Downlaods App (Android) ', (report, done) => {

  RNFetchBlob
    .config({ path : dirs.DocumentDir + '/github'+new Date()+'.png' })
    .fetch('GET', `${TEST_SERVER_URL}/public/github.png`)
    .then((res) => {
      console.log(res.path())
      return RNFetchBlob.android.addCompleteDownload({
        title : 'test file of RNFB',
        description : 'desc',
        mime : 'image/png',
        path : res.path(),
        showNotification : true
      })
    })
    .then(() => {
      done()
    })

})
