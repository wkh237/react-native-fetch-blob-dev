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

describe('ls API test', (report, done) => {
  // Setup
  let p = dirs.DocumentDir + '/unlink-test-' + Date.now()
  fs.createFile(p, 'write' + Date.now(), 'utf8')
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
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
    done()
  })

  // Test - File (error)
  .then(() => fs.ls(p))
  .then((list) => {
    report(<Assert key="should have failed" expect={false} actual={true}/>)
  })
  .catch((err) => {
    report(<Assert key="File instead of directory should fail" expect={'ENODIR'} actual={err.code}/>)
  })

  // Test - non-existent file (error)
  .then(() => fs.ls('hh87h8uhi'))
  .catch((err) => {
    report(<Assert key="Wrong path should have error" expect={'ENOENT'} actual={err.code}/>)
    done()
  })
})

describe('exists API test', (report, done) => {
  fs.exists(dirs.DocumentDir)
  .then((exist) => {
    report(<Assert key="document dir should exist" expect={true} actual={exist}/>)
  })
  .catch((err) => {
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.exists('blabajsdio'))
  .then((exist) => {
    report(<Assert key="path should not exist" expect={false} actual={exist}/>)
    done()
  })
  .catch((err) => {
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
    done()
  })
})

describe('create file API test', (report, done) => {
  let p = dirs.DocumentDir + '/test-' + Date.now()
  let raw = 'hello ' + Date.now()
  let base64 = RNFetchBlob.base64.encode(raw)

  fs.createFile(p, raw, 'utf8')
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
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
    done()
  })

  function testBase64 () {
    fs.createFile(p + '-base64', RNFetchBlob.base64.encode(raw), 'base64')
    .then(() => fs.readStream(p + '-base64', 'utf8'))
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
      report(<Assert key="should not have failed" expect={null} actual={err}/>)
      done()
    })
  }
})

describe('mkdir and isDir API test', (report, done) => {
  let p = dirs.DocumentDir + '/mkdir-test-' + Date.now()

  fs.mkdir(p)
  .then((err) => {
    report(<Assert key="folder should be created without error" expect={true} actual={err}/>)
  })
  .catch((err) => {
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.exists(p))
  .then((exist) => {
    report(<Assert key="mkdir should work correctly" expect={true} actual={exist}/>)
  })
  .catch((err) => {
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.isDir(p))
  .then((isDir) => {
    report(<Assert key="isDir should work correctly" expect={true} actual={isDir}/>)
  })
  .catch((err) => {
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
  })

  .then(() => fs.mkdir(p))
  .catch((err) => {
    report(<Assert key="isDir should not work when folder exists" expect={'EEXIST'} actual={err.code}/>)
    done()
  })
})

describe('unlink and mkdir API test', (report, done) => {
  let p = dirs.DocumentDir + '/unlink-test-' + Date.now()

  fs.createFile(p, 'write' + Date.now(), 'utf8')
  .then(() => fs.exists(p))
  .then((exist) => {
    report(<Assert key="file created" expect={true} actual={exist}/>)
  })
  .catch((err) => {
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.unlink(p))
  .then(() => fs.exists(p))
  .then((exist) => {
    report(<Assert key="file removed" expect={false} actual={exist}/>)
  })
  .catch((err) => {
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.mkdir(p + '-dir'))
  .then(() => fs.exists(p + '-dir'))
  .then((exist) => {
    report(<Assert key="mkdir should success" expect={true} actual={exist}/>)
  })
  .catch((err) => {
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.unlink(p + '-dir'))
  .then(() => fs.exists(p + '-dir'))
  .then((exist) => {
    report(<Assert key="folder should be removed" expect={false} actual={exist}/>)
    done()
  })
  .catch((err) => {
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
    done()
  })
})

describe('write stream API test', (report, done) => {
  let p = dirs.DocumentDir + '/write-stream' + Date.now()
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
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
    done()
  })

  function base64Test () {
    fs.writeStream(p, 'base64', false)
    .then((ws) => {
      for (let i = 0; i < 100; i++) {
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
      report(<Assert key="should not have failed" expect={null} actual={err}/>)
      done()
    })
  }
})

describe('mv API test', {timeout: 10000}, (report, done) => {
  let p = dirs.DocumentDir + '/mvTest' + Date.now()
  let dest = p + '-dest-' + Date.now()
  let content = Date.now() + '-test'

  fs.createFile(p, content, 'utf8')
  .then(() => fs.mkdir(dest))
  .then(() => fs.mv(p, dest + '/moved'))
  .then(() => fs.exists(p))
  .then((exist) => {
    report(<Assert key="file should not exist in old path" expect={false} actual={exist}/>)
  })
  .catch((err) => {
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.exists(dest + '/moved'))
  .then((exist) => {
    report(<Assert key="file should be moved to destination" expect={true} actual={exist}/>)
  })
  .catch((err) => {
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.ls(dest))
  .then((files) => {
    report(<Assert key="file name should be correct" expect={'moved'} actual={files[0]}/>)
  })
  .catch((err) => {
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.readStream(dest + '/moved'))
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
      report(<Assert key="file content should be correct" expect={content} actual={actual}/>)
      done()
    })
  })
  .catch((err) => {
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
    done()
  })
})

describe('cp API test', {timeout: 10000}, (report, done) => {
  let p = dirs.DocumentDir + '/cpTest' + Date.now()
  let dest = p + '-dest-' + Date.now()
  let content = Date.now() + '-test'

  fs.createFile(p, content, 'utf8')
  .then(() => fs.mkdir(dest))
  .then(() => fs.cp(p, dest + '/cp'))
  .then(() => fs.exists(dest + '/cp'))
  .then((exist) => {
    report(<Assert key="file should be copy to destination" expect={true} actual={exist}/>)
  })
  .catch((err) => {
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.ls(dest))
  .then((files) => {
    report(<Assert key="file name should be correct" expect={'cp'} actual={files[0]}/>)
  })
  .catch((err) => {
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.readStream(dest + '/cp'))
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
      report(<Assert key="file content should be correct" expect={content} actual={actual}/>)
      done()
    })
  })
  .catch((err) => {
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
    done()
  })
})

describe('ASCII data test', (report, done) => {
  let p = dirs.DocumentDir + '/ASCII-test-' + Date.now()
  let expect = 'fetch-blob-' + Date.now()

  fs.createFile(p, '', 'utf8')
  .then(() => fs.writeStream(p, 'ascii', false))
  .then((stream) => {
    const promises = []
    for (let i = 0; i < expect.length; i++) {
      promises.push(stream.write([expect[i].charCodeAt(0)]))
    }
    promises.push(stream.write(['g'.charCodeAt(0), 'g'.charCodeAt(0)]))
    return Promise.all(promises).then(() => stream.close())
  })
  .catch((err) => {
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
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
      report(<Assert key="data written in ASCII format should correct" expect={expect + 'gg'} actual={res}/>)
      done()
    })
  })
  .catch((err) => {
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
    done()
  })
})

describe('ASCII file test', (report, done) => {
  let p = dirs.DocumentDir + '/'
  let filename = 'ASCII-file-test' + Date.now() + '.txt'
  let expect = 'ascii test ' + Date.now()
  let base64 = RNFetchBlob.base64

  fs.createFile(p + filename, getASCIIArray(expect), 'ascii')
  .then(() => fs.readStream(p + filename, 'base64'))
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
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
    done()
  })
})

describe('format conversion', (report, done) => {
  let p = dirs.DocumentDir + '/foo-' + Date.now()

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
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
    done()
  })
})

describe('stat and lstat test', (report, done) => {
  let file = null
  const expect = ['size', 'type', 'lastModified', 'filename', 'path']

  fs.lstat(dirs.DocumentDir)  // stat a folder
  .then((stat) => {
    report(<Assert key="result should be an array" expect={true} actual={Array.isArray(stat)}/>)
    file = stat[0].path
  })
  .catch((err) => {
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.stat(file))  // stat a file
  .then((stat) => {
    report(<Assert key="should have properties" expect={expect} comparer={Comparer.hasProperties} actual={stat}/>)
  })
  .catch((err) => {
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.stat('13123132'))
  .then((list) => {
    report(<Assert key="should have failed" expect={false} actual={true}/>)
  })
  .catch((err) => {
    report(<Assert key="stat of non-existent file should fail" expect={true} actual={true}/>)
    done()
  })
})

describe('fs.slice test', (report, done) => {
  let source = null
  let parts = fs.dirs.DocumentDir + '/tmp-source-'
  let dests = []
  let combined = fs.dirs.DocumentDir + '/combined-' + Date.now() + '.jpg'
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
    while (cursor < size) {
      promise = promise.then(function (start) {
        console.log('slicing part ', start, start + 40960)
        let offset = 0
        return fs.slice(source, parts + start, start + offset, start + 40960)
        .then((dest) => {
          console.log('slicing part ', start + offset, start + 40960, 'done')
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
    for (let d in dests) {
      p = p.then(function (chunk) {
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
        <Image key="combined image" style={styles.image} source={{uri: prefix + combined}}/>
      </Info>
    )
    done()
  })
  .catch((err) => {
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
    done()
  })
})

describe('hash API test', (report, done) => {
  const txtFile = dirs.DocumentDir + '/hash-test-txt-' + Date.now()
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
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.hash(txtFile, 'sha256'))
  .then((hash) => {
    report(<Assert key="SHA-256 hash of text file should be created" expect={'92fc68e5477e96c2beac69237bb8449350a358bd5a6fe578d1b374814b1f4486'} actual={hash}/>)
  })
  .catch((err) => {
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.hash(binFile, 'md5'))
  .then((hash) => {
    report(<Assert key="MD5 hash of binary file should be created" expect={'c7e6697f842252de45eb70eb6314987a'} actual={hash}/>)
  })
  .catch((err) => {
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
    done()
  })

  .then(() => fs.hash(binFile, 'sha256'))
  .then((hash) => {
    report(<Assert key="SHA-256 hash of binary file should be created" expect={'ffb5be2160cc5d594378a71e187ccfe06b0829877721e285669c01467c175ca7'} actual={hash}/>)
  })

  .then(() => invalidFilenameCheck())

  .then(() => dirInsteadOfFileCheck())

  .then(() => invalidAlgorithmCheck())

  .then(() => done())
  .catch((err) => {
    report(<Assert key="should not have failed" expect={null} actual={err}/>)
    done()
  })

  function invalidFilenameCheck () {
    return fs.hash('INVALID_FILE', 'sha256')
    .then(() => report(<Assert key="should have reported 'file not found'" expect={false} actual={true}/>))
    .catch((err) => {
      report(<Assert key="Non-existing file should cause error" expect={'ENOENT'} actual={err.code}/>)
    })
  }

  function dirInsteadOfFileCheck () {
    return fs.hash(dirs.DocumentDir, 'sha256')
    .then(() => report(<Assert key="should have reported 'is a directory'" expect={false} actual={true}/>))
    .catch((err) => {
      report(<Assert key="Directory instead of file should cause error" expect={'EISDIR'} actual={err.code}/>)
    })
  }

  function invalidAlgorithmCheck () {
    return fs.hash(binFile, 'INVALID')
    .then(() => report(<Assert key="should have reported 'invalid algorithm'" expect={false} actual={true}/>))
    .catch((err) => {
      report(<Assert key="Invalid hash algorithm should cause error" expect={'EINVAL'} actual={err.code}/>)
    })
  }
})

false && describe('binary data to ascii file size checking', (report, done) => {
  let file = null
  let expectedSize = 0

  RNFetchBlob.config({fileCache: true})
  .fetch('GET', `${TEST_SERVER_URL}/public/beethoven.mp3`)
  .then((res) => {
    file = res.path()
    return fs.stat(file)
  })
  .then((stat) => {
    expectedSize = Math.floor(stat.size)
    return fs.readStream(file, 'ascii')
  })
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
})

function getASCIIArray (str) {
  let r = []
  for (let i = 0; i < str.length; i++) {
    r.push(str[i].charCodeAt(0))
  }
  return r
}
