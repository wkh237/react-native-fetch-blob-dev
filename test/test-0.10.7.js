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
  group : '0.10.6',
  run : true,
  expand : true,
  timeout : 20000,
})
const { TEST_SERVER_URL, TEST_SERVER_URL_SSL, FILENAME, DROPBOX_TOKEN, styles } = prop()
const dirs = RNFetchBlob.fs.dirs
let prefix = ((Platform.OS === 'android') ? 'file://' : '')
let begin = Date.now()

describe('HTTPS request should be cancellable when fileCache or path is set', (report, done) => {

  let task = RNFetchBlob
  .config({
    overwrite : true,
    path : dirs.DocumentDir + '/test-download'
  })
  .fetch('GET', 'https://rnfb-test-app.firebaseapp.com/22mb-dummy')
  setTimeout(() => {
    task.cancel()
  }, 2000)
  task
  .then((res) => {
    report(<Assert key="task should be canceled" expect={true} actual={false}/>)
    done()
  })
  .catch(() => {
    report(<Assert key="task should be canceled" expect={true} actual={true}/>)
    done()
  })

})
