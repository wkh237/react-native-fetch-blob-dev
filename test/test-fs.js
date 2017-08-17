import RNTest from './react-native-testkit/'
import React from 'react'
import RNFetchBlob from 'react-native-fetch-blob'

import {Dimensions, Image, Platform, ScrollView, StyleSheet, Text, View,} from 'react-native';

const {Assert, Comparer, Info, prop} = RNTest
const fs = RNFetchBlob.fs
const describe = RNTest.config({
  group: 'fs',
  expand: false,
  run: true
})

let {TEST_SERVER_URL, FILENAME, DROPBOX_TOKEN, styles, image} = prop()
let dirs = RNFetchBlob.fs.dirs
let prefix = ((Platform.OS === 'android') ? 'file://' : '')

describe('Get storage folders', (report, done) => {
  report(
    <Assert key="system folders should exists" expect={dirs} comparer={Comparer.exists}/>,
    <Assert key="check properties" expect={['DocumentDir', 'CacheDir']} comparer={Comparer.hasProperties} actual={dirs}/>,
    <Info key="System Folders">
      <Text>{`${JSON.stringify(dirs)}`}</Text>
    </Info>
  )
  done()
})

describe('writeFile and readFile test', (report, done) => {
  let path = dirs.DocumentDir+'/0.6.0-'+Date.now()+'/writeFileTest'+Date.now()
  let data = 'hellofrom'+Date.now()

  // SETUP: make sure the test file does not yet exist so that we implicitly test that
  // writeFile creates the file in that case (also fixes #483)
  fs.exists(path)
  .then((exists) => exists ? fs.unlink(path) : Promise.resolve())
  .catch((err) => {
    report(<Assert key="setup should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.readFile(path))
  .then(() => report(<Assert key="should have reported 'file not found'" expect={false} actual={true}/>))
  .catch((err) => {
    report(
      <Assert key="Non-existing file should cause error" expect={'ENOENT'} actual={err.code}/>,
      <Info key="error message">
        <Text>{String(err)}</Text>
      </Info>
    )
  })

  .then(() => fs.readFile(dirs.DocumentDir))
  .then(() => report(<Assert key="should have reported 'is a directory'" expect={false} actual={true}/>))
  .catch((err) => {
    report(
      <Assert key="is-a-directory test error" expect={'EISDIR'} actual={err.code}/>,
      <Info key="error message">
        <Text>{String(err)}</Text>
      </Info>
    )
  })

  .then(() => fs.writeFile(path, data))
  .then(() => fs.readFile(path))
  .then((actual) => {
    report(<Assert key="utf8 contents should be correct" expect={data} actual={actual}/>)
    data = 'base64'
  })
  .catch((err) => {
    report(<Assert key="utf8 contents check should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.writeFile(path, RNFetchBlob.base64.encode('base64'), 'base64'))
  .then(() => fs.readFile(path, 'base64'))
  .then((actual) => {
    const expect = RNFetchBlob.base64.decode(RNFetchBlob.base64.encode(data))
    report(<Assert key="base64 contents should be correct" expect={expect} actual={RNFetchBlob.base64.decode(actual)}/>)
    data = 'ascii'
  })
  .catch((err) => {
    report(<Assert key="base64 contents check should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.writeFile(path, getASCIIArray('ascii'), 'ascii'))
  .then(() => fs.readFile(path, 'ascii'))
  .then((actual) => {
    console.log(getASCIIArray(data), actual)
    report(<Assert key="ascii contents should be correct" expect={getASCIIArray(data)} comparer={Comparer.equalToArray} actual={actual}/>)
    done()
  })
  .catch((err) => {
    report(<Assert key="ascii contents check should not have failed" expect={null} actual={err}/>)
    done()
  })
})

describe('append file test', (report, done) => {
  let path = dirs.DocumentDir+'/append-test'+Date.now()
  let content = 'test on '+Date.now()

  fs.writeFile(path, content, 'utf8')
  .then(() => fs.appendFile(path, '100', 'utf8', true))
  .then(() => fs.readFile(path, 'utf8'))
  .then((data) => {
    report(<Assert key="utf8 data should be appended" expect={content+'100'} actual={data}/>)
  })
  .catch((err) => {
    report(<Assert key="utf8 data check should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.appendFile(path, getASCIIArray('200'), 'ascii'))
  .then(() => fs.readFile(path, 'ascii'))
  .then((data) => {
    report(<Assert key="ascii data should be appended" expect={getASCIIArray(content+'100'+'200')} comparer={Comparer.equalToArray} actual={data}/>)
  })
  .catch((err) => {
    report(<Assert key="ascii data check should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.appendFile(path, RNFetchBlob.base64.encode('300'), 'base64'))
  .then(() => fs.readFile(path, 'base64'))
  .then((data) => {
    const actual = RNFetchBlob.base64.decode(data)
    report(<Assert key="base64 data should be appended" expect={content+'100'+'200'+'300'} actual={actual}/>)
    done()
  })
  .catch((err) => {
    report(<Assert key="base64 data check should not have failed" expect={null} actual={err}/>)
    done()
  })
})

describe('ls API test', (report, done) => {
  // Setup
  let p = dirs.DocumentDir+'/unlink-test-'+Date.now()
  fs.createFile(p, 'write'+Date.now(), 'utf8')
  .then(() => fs.exists(p))
  .catch((err) => {
    report(<Assert key="Error creating file for test setup" expect={null} actual={err}/>)
    done()
  })

  // Test - Directory (okay)
  .then(() => fs.ls(dirs.DocumentDir))
  .then((list) => {
    report(<Assert key="result must be an Array" expect={true} actual={Array.isArray(list)}/>)
  })
  .catch((err) => {
    report(<Assert key="array result check should not have failed" expect={null} actual={err}/>)
    done()
  })

  // Test - File (error)
  .then(() => fs.ls(p))
  .then(() => {
    report(<Assert key="ls of file should have failed" expect={false} actual={true}/>)
  })
  .catch((err) => {
    report(
      <Assert key="File instead of directory should fail" expect={'ENODIR'} actual={err.code}/>,
      <Info key="error message">
        <Text>{String(err)}</Text>
      </Info>
    )
  })

  // Test - non-existent file (error)
  .then(() => fs.ls('hh87h8uhi'))
  .catch((err) => {
    report(
      <Assert key="Wrong path should have error" expect={'ENOENT'} actual={err.code}/>,
      <Info key="error message">
        <Text>{String(err)}</Text>
      </Info>
    )
    done()
  })
})

describe('exists API test', (report, done) => {
  fs.exists(dirs.DocumentDir)
  .then((exist) => {
    report(<Assert key="document dir should exist" expect={true} actual={exist}/>)
  })
  .catch((err) => {
    report(<Assert key="dir existence check should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.exists('blabajsdio'))
  .then((exist) => {
    report(<Assert key="path should not exist" expect={false} actual={exist}/>)
    done()
  })
  .catch((err) => {
    report(<Assert key="path existence check should not have failed" expect={null} actual={err}/>)
    done()
  })
})

describe('create file API test', (report, done) => {
  let p = dirs.DocumentDir+'/test-'+Date.now()
  let raw = 'hello '+Date.now()

  fs.createFile(p, raw, 'utf8')
  .then(() => fs.createFile(p, raw, 'utf8'))
  .then(() => report(<Assert key="should have reported 'file exists'" expect={false} actual={true}/>))
  .catch((err) => {
    report(
      <Assert key="Already existing file should cause error" expect={'EEXIST'} actual={err.code}/>,
      <Info key="error message">
        <Text>{String(err)}</Text>
      </Info>
    )
  })

  .then(() => fs.readStream(p, 'utf8'))
  .then((stream) => {
    let d = ''
    stream.open()
    stream.onData((chunk) => {
      d += chunk
    })
    stream.onError((err) => {
      // Outside the promise
      report(<Assert key="Error" expect={null} actual={err}/>)
    })
    stream.onEnd(() => {
      report(<Assert key="utf8 content test" expect={raw} actual={d}/>)
      testBase64()
    })
  })
  .catch((err) => {
    report(<Assert key="creatFile API tests should not have failed" expect={null} actual={err}/>)
    done()
  })

  function testBase64() {
    fs.createFile(p+'-base64', RNFetchBlob.base64.encode(raw), 'base64')
    .then(() => fs.readStream(p+'-base64', 'utf8'))
    .then((stream) => {
      let d = ''
      stream.open()
      stream.onData((chunk) => {
        d += chunk
      })
      stream.onError((err) => {
        // Outside the promise
        report(<Assert key="Error" expect={null} actual={err}/>)
      })
      stream.onEnd(() => {
        report(<Assert key="base64 content test" expect={raw} actual={d}/>)
        done()
      })
    })
    .catch((err) => {
      report(<Assert key="base64 createFile API tests should not have failed" expect={null} actual={err}/>)
      done()
    })
  }
})

describe('mkdir and isDir API test', (report, done) => {
  let p = dirs.DocumentDir+'/mkdir-test-'+Date.now()

  fs.mkdir(p)
  .then((res) => {
    report(<Assert key="folder should be created without error" expect={true} actual={res}/>)
  })
  .catch((err) => {
    report(<Assert key="mkdir should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.exists(p))
  .then((exist) => {
    report(<Assert key="mkdir should work correctly" expect={true} actual={exist}/>)
  })
  .catch((err) => {
    report(<Assert key="exists should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.isDir(p))
  .then((isDir) => {
    report(<Assert key="isDir should work correctly" expect={true} actual={isDir}/>)
  })
  .catch((err) => {
    report(<Assert key="isDir should not have failed" expect={null} actual={err}/>)
  })

  .then(() => fs.mkdir(p))
  .catch((err) => {
    report(
      <Assert key="isDir should fail when folder exists" expect={'EEXIST'} actual={err.code}/>,
      <Info key="error message">
        <Text>{String(err)}</Text>
      </Info>
    )
    done()
  })
})

describe('unlink and mkdir API test', (report, done) => {
  let p = dirs.DocumentDir+'/unlink-test-'+Date.now()

  fs.createFile(p, 'write'+Date.now(), 'utf8')
  .then(() => fs.exists(p))
  .then((exist) => {
    report(<Assert key="file created" expect={true} actual={exist}/>)
  })
  .catch((err) => {
    report(<Assert key="file creation should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.unlink(p))
  .then(() => fs.exists(p))
  .then((exist) => {
    report(<Assert key="file removed" expect={false} actual={exist}/>)
  })
  .catch((err) => {
    report(<Assert key="file removal should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.mkdir(p+'-dir'))
  .then(() => fs.exists(p+'-dir'))
  .then((exist) => {
    report(<Assert key="mkdir should success" expect={true} actual={exist}/>)
  })
  .catch((err) => {
    report(<Assert key="making of directory should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.unlink(p+'-dir'))
  .then(() => fs.exists(p+'-dir'))
  .then((exist) => {
    report(<Assert key="folder should be removed" expect={false} actual={exist}/>)
    done()
  })
  .catch((err) => {
    report(<Assert key="removal of directory should not have failed" expect={null} actual={err}/>)
    done()
  })
})

describe('write stream API test', (report, done) => {
  let p = dirs.DocumentDir+'/write-stream'+Date.now()
  let expect = ''

  fs.createFile(p, '1234567890', 'utf8')
  .then(() => fs.writeStream(p, 'utf8', true))
  .then((ws) => {
    ws.write('11')
    ws.write('12')
    ws.write('13')
    ws.write('14')
    return ws.close()
  })
  .then(() => fs.readStream(p, 'utf8'))
  .then((stream) => {
    let d1 = ''
    stream.open()
    stream.onData((chunk) => {
      d1 += chunk
    })
    stream.onError((err) => {
      // Outside the promise
      report(<Assert key="Error" expect={null} actual={err}/>)
    })
    stream.onEnd(() => {
      report(<Assert key="write data async test" expect={'123456789011121314'} actual={d1}/>)
      return base64Test()
    })
  })
  .catch((err) => {
    report(<Assert key="write stream API tests should not have failed" expect={null} actual={err}/>)
    done()
  })

  function base64Test() {
    fs.writeStream(p, 'base64', false)
    .then((ws) => {
      for(let i = 0; i < 100; i++) {
        expect += String(i)
      }
      ws.write(RNFetchBlob.base64.encode(expect))
      return ws.close()
    })
    .then(() => fs.readStream(p, 'base64'))
    .then((stream) => {
      let d2 = ''
      stream.open()
      stream.onData((chunk) => {
        d2 += chunk
      })
      stream.onError((err) => {
        // Outside the promise
        report(<Assert key="Error" expect={null} actual={err}/>)
      })
      stream.onEnd(() => {
        report(<Assert key="file should be overwritten by base64 encoded data" expect={RNFetchBlob.base64.encode(expect)} actual={d2}/>)
        done()
      })
    })
    .catch((err) => {
      report(<Assert key="base64 write stream API tests should not have failed" expect={null} actual={err}/>)
      done()
    })
  }
})

describe('mv API test', {timeout: 10000}, (report, done) => {
  let p = dirs.DocumentDir+'/mvTest'+Date.now()
  let dest = p+'-dest-'+Date.now()
  let content = Date.now()+'-test'

  fs.createFile(p, content, 'utf8')
  .then(() => fs.mkdir(dest))
  .then(() => fs.mv(p, dest+'/moved'))
  .then(() => fs.exists(p))
  .then((exist) => {
    report(<Assert key="file should not exist in old path" expect={false} actual={exist}/>)
  })
  .catch((err) => {
    report(<Assert key="'file should not exist in old path' test should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.exists(dest+'/moved'))
  .then((exist) => {
    report(<Assert key="file should be moved to destination" expect={true} actual={exist}/>)
  })
  .catch((err) => {
    report(<Assert key="'file should be moved' test should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.ls(dest))
  .then((files) => {
    report(<Assert key="file name for mv-to-dest should be correct" expect={'moved'} actual={files[0]}/>)
  })
  .catch((err) => {
    report(<Assert key="'file name for mv-to-dest should be correct' test should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.readStream(dest+'/moved'))
  .then((stream) => {
    let actual = ''
    stream.open()
    stream.onData((chunk) => {
      actual += chunk
    })
    stream.onError((err) => {
      // Outside the promise
      report(<Assert key="Error" expect={null} actual={err}/>)
    })
    stream.onEnd(() => {
      report(<Assert key="moved file content should be correct" expect={content} actual={actual}/>)
      done()
    })
  })
  .catch((err) => {
    report(<Assert key="'moved file content should be correct' test should not have failed" expect={null} actual={err}/>)
    done()
  })
})

describe('cp API test', {timeout: 10000}, (report, done) => {
  let p = dirs.DocumentDir+'/cpTest'+Date.now()
  let dest = p+'-dest-'+Date.now()
  let content = Date.now()+'-test'

  fs.createFile(p, content, 'utf8')
  .then(() => fs.mkdir(dest))
  .then(() => fs.cp(p, dest+'/cp'))
  .then(() => fs.exists(dest+'/cp'))
  .then((exist) => {
    report(<Assert key="file should be copy to destination" expect={true} actual={exist}/>)
  })
  .catch((err) => {
    report(<Assert key="'file should be copy to destination' test should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.ls(dest))
  .then((files) => {
    report(<Assert key="file name for cp-to-test should be correct" expect={'cp'} actual={files[0]}/>)
  })
  .catch((err) => {
    report(<Assert key="'file name for cp-to-test should be correct' test should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.readStream(dest+'/cp'))
  .then((stream) => {
    let actual = ''
    stream.open()
    stream.onData((chunk) => {
      actual += chunk
    })
    stream.onError((err) => {
      // Outside the promise
      report(<Assert key="Error" expect={null} actual={err}/>)
    })
    stream.onEnd(() => {
      report(<Assert key="copied file content should be correct" expect={content} actual={actual}/>)
      done()
    })
  })
  .catch((err) => {
    report(<Assert key="'copied file content should be correct' test should not have failed" expect={null} actual={err}/>)
    done()
  })
})

describe('ASCII data test', (report, done) => {
  let p = dirs.DocumentDir+'/ASCII-test-'+Date.now()
  let expect = 'fetch-blob-'+Date.now()

  fs.createFile(p, '', 'utf8')
  .then(() => fs.writeStream(p, 'ascii', false))
  .then((stream) => {
    const promises = []
    for(let i = 0; i < expect.length; i++) {
      promises.push(stream.write([expect[i].charCodeAt(0)]))
    }
    promises.push(stream.write(['g'.charCodeAt(0), 'g'.charCodeAt(0)]))
    return Promise.all(promises).then(() => stream.close())
  })
  .catch((err) => {
    report(<Assert key="writing ASCII data stream should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.readStream(p, 'ascii'))
  .then((stream) => {
    let res = []
    stream.open()
    stream.onData((chunk) => {
      res = res.concat(chunk)
    })
    stream.onError((err) => {
      // Outside the promise
      report(<Assert key="Error" expect={null} actual={err}/>)
    })
    stream.onEnd(() => {
      res = res.map((byte) => String.fromCharCode(byte)).join('')
      report(<Assert key="data written in ASCII format should be correct" expect={expect+'gg'} actual={res}/>)
      done()
    })
  })
  .catch((err) => {
    report(<Assert key="reading ASCII data stream should not have failed" expect={null} actual={err}/>)
    done()
  })
})

describe('ASCII file test', (report, done) => {
  let p = dirs.DocumentDir+'/'
  let filename = 'ASCII-file-test'+Date.now()+'.txt'
  let expect = 'ascii test '+Date.now()
  let base64 = RNFetchBlob.base64

  fs.createFile(p+filename, getASCIIArray(expect), 'ascii')
  .then(() => fs.readStream(p+filename, 'base64'))
  .then((stream) => {
    let actual = ''
    stream.open()
    stream.onData((chunk) => {
      actual += chunk
    })
    stream.onError((err) => {
      // Outside the promise
      report(<Assert key="Error" expect={null} actual={err}/>)
    })
    stream.onEnd(() => {
      report(<Assert key="written data verify" expect={expect} actual={base64.decode(actual)}/>)
      done()
    })
  })
  .catch((err) => {
    report(<Assert key="ASCII data varification should not have failed" expect={null} actual={err}/>)
    done()
  })
})

describe('format conversion', (report, done) => {
  let p = dirs.DocumentDir+'/foo-'+Date.now()

  fs.createFile(p, [102, 111, 111], 'ascii')
  .then(() => fs.readStream(p, 'utf8'))
  .then((stream) => {
    let res = []
    stream.open()
    stream.onData((chunk) => {
      res += chunk
    })
    stream.onError((err) => {
      // Outside the promise
      report(<Assert key="Error" expect={null} actual={err}/>)
    })
    stream.onEnd(() => {
      report(<Assert key="write utf8 and read by ascii" expect="foo" actual={res}/>)
      done()
    })
  })
  .catch((err) => {
    report(<Assert key="'write utf8 and read by ascii' test should not have failed" expect={null} actual={err}/>)
    done()
  })
})

describe('stat and lstat test', (report, done) => {
  let file = null
  const expect = ['size', 'type', 'lastModified', 'filename', 'path']

  fs.lstat(dirs.DocumentDir)  // stat a folder
  .then((stat) => {
    report(<Assert key="lstat result should be an array" expect={true} actual={Array.isArray(stat)}/>)
    file = stat[0].path
  })
  .catch((err) => {
    report(<Assert key="'lstat result should be an array' test should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.stat(file))  // stat a file
  .then((stat) => {
    report(<Assert key="stat of file should have properties" expect={expect} comparer={Comparer.hasProperties} actual={stat}/>)
  })
  .catch((err) => {
    report(<Assert key="'stat of file should have properties' test should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.stat('13123132'))
  .then(() => {
    report(<Assert key="stat of invalid file should have failed" expect={false} actual={true}/>)
  })
  .catch((err) => {
    report(<Assert key="stat of non-existent file should fail" expect={true} actual={true}/>)
    done()
  })
})

describe('fs.slice test', (report, done) => {
  let source = null
  let parts = fs.dirs.DocumentDir+'/tmp-source-'
  let dests = []
  let combined = fs.dirs.DocumentDir+'/combined-'+Date.now()+'.jpg'
  let size = 0

  window.fetch = new RNFetchBlob.polyfill.Fetch({
    auto: true,
    binaryContentTypes: ['image/', 'video/', 'audio/']
  }).build()

  fetch(`${TEST_SERVER_URL}/public/github2.jpg`)
  .then((res) => res.rawResp())
  .then((res) => {
    source = res.path()
  })
  .then(() => fs.stat(source))
  // separate file into 4kb chunks
  .then((stat) => {
    size = stat.size
    let promise = Promise.resolve()
    let cursor = 0
    while(cursor < size) {
      promise = promise.then(function(start) {
        console.log('slicing part ', start, start+40960)
        let offset = 0
        return fs.slice(source, parts+start, start+offset, start+40960)
        .then((dest) => {
          console.log('slicing part ', start+offset, start+40960, 'done')
          dests.push(dest)
          return Promise.resolve()
        })
      }.bind(this, cursor))
      cursor += 40960
    }
    console.log('loop end')
    return promise
  })
  // combine chunks and verify the result
  .then(() => {
    console.log('combinding files')
    let p = Promise.resolve()
    for(let d in dests) {
      p = p.then(function(chunk) {
        return fs.appendFile(combined, chunk, 'uri').then((write) => {
          console.log(write, 'bytes write')
        })
      }.bind(this, dests[d]))
    }
    return p
  })
  .then(() => fs.stat(combined))
  .then((stat) => {
    report(
      <Assert key="verify file size" expect={size} actual={stat.size}/>,
      <Info key="image viewer">
        <Image key="combined image" style={styles.image} source={{uri: prefix+combined}}/>
      </Info>
    )
    done()
  })
  .catch((err) => {
    report(<Assert key="fs.slice test should not have failed" expect={null} actual={err}/>)
    done()
  })
})

describe('hash API test', (report, done) => {
  const txtFile = dirs.DocumentDir+'/hash-test-txt-'+Date.now()
  let binFile;

  fetch(`${TEST_SERVER_URL}/public/github2.jpg`)
  .then((res) => res.rawResp())
  .then((res) => {
    binFile = res.path()
  })
  .then(() => fs.createFile(txtFile, 'What is SHA-256? The SHA (Secure Hash Algorithm) is one of a number of cryptographic hash functions.', 'utf8'))
  .catch((err) => {
    report(<Assert key="test setup should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.hash(txtFile, 'md5'))
  .then((hash) => {
    report(<Assert key="MD5 hash of text file should be created" expect={'3fce512da59b4abda4c5f37ef7859443'} actual={hash}/>)
  })
  .catch((err) => {
    report(<Assert key="md5 of text file should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.hash(txtFile, 'sha256'))
  .then((hash) => {
    report(<Assert key="SHA-256 hash of text file should be created" expect={'92fc68e5477e96c2beac69237bb8449350a358bd5a6fe578d1b374814b1f4486'} actual={hash}/>)
  })
  .catch((err) => {
    report(<Assert key="sha256 of text file should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.hash(binFile, 'md5'))
  .then((hash) => {
    report(<Assert key="MD5 hash of binary file should be created" expect={'c7e6697f842252de45eb70eb6314987a'} actual={hash}/>)
  })
  .catch((err) => {
    report(<Assert key="md5 of binary file should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.hash(binFile, 'sha256'))
  .then((hash) => {
    report(<Assert key="SHA-256 hash of binary file should be created" expect={'ffb5be2160cc5d594378a71e187ccfe06b0829877721e285669c01467c175ca7'} actual={hash}/>)
  })
  .catch((err) => {
    report(<Assert key="sha256 of binary file should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => invalidFilenameCheck())

  .then(() => dirInsteadOfFileCheck())

  .then(() => invalidAlgorithmCheck())

  .then(() => done())
  .catch((err) => {
    report(<Assert key="hash API tests should not have failed" expect={null} actual={err}/>)
    done()
  })

  function invalidFilenameCheck() {
    return fs.hash('INVALID_FILE', 'sha256')
    .then(() => report(<Assert key="should have reported 'INVALID_FILE file not found'" expect={false} actual={true}/>))
    .catch((err) => {
      report(
        <Assert key="Non-existing file should cause error" expect={'ENOENT'} actual={err.code}/>,
        <Info key="error message">
          <Text>{String(err)}</Text>
        </Info>
      )
    })
  }

  function dirInsteadOfFileCheck() {
    return fs.hash(dirs.DocumentDir, 'sha256')
    .then(() => report(<Assert key="should have reported 'is a directory'" expect={false} actual={true}/>))
    .catch((err) => {
      report(
        <Assert key="Directory instead of file should cause error" expect={'EISDIR'} actual={err.code}/>,
        <Info key="error message">
          <Text>{String(err)}</Text>
        </Info>
      )
    })
  }

  function invalidAlgorithmCheck() {
    return fs.hash(binFile, 'INVALID')
    .then(() => report(<Assert key="should have reported 'invalid algorithm'" expect={false} actual={true}/>))
    .catch((err) => {
      report(
        <Assert key="Invalid hash algorithm should cause error" expect={'EINVAL'} actual={err.code}/>,
        <Info key="error message">
          <Text>{String(err)}</Text>
        </Info>
      )
    })
  }
})

describe('binary data to ascii file size checking', (report, done) => {
  let file = null
  let expectedSize = 0

  RNFetchBlob.config({fileCache: true})
  .fetch('GET', `${TEST_SERVER_URL}/public/beethoven.mp3`)
  .then((res) => {
    file = res.path()
  })
  .then(() => fs.stat(file))
  .then((stat) => {
    expectedSize = Math.floor(stat.size)
  })
  .then(() => fs.readStream(file, 'ascii'))
  .then((stream) => {
    let actual = 0
    stream.open()
    stream.onData((chunk) => {
      actual += chunk.length
    })
    stream.onEnd(() => {
      report(<Assert key="check mp3 file size" expect={expectedSize} actual={actual}/>)
      done()
    })
  })
  .catch((err) => {
    report(<Assert key="bin. data to ascii file size test should not have failed" expect={null} actual={err}/>)
    done()
  })
})

function getASCIIArray(str) {
  let r = []
  for(let i = 0; i < str.length; i++) {
    r.push(str[i].charCodeAt(0))
  }
  return r
}
