# react-native-fetch-blob dev environment

This repository is for developers who interested in modifying and improving [react-native-fetch-blob](https://github.com/wkh237/react-native-fetch-blob).

## Feature branch [v0.11.0](https://github.com/wkh237/react-native-fetch-blob/tree/0.11.0)
## Bug fix branch [v0.10.6](https://github.com/wkh237/react-native-fetch-blob/tree/0.10.6)

## prerequisites
- node.js > 5.1.0
- A valid [Dropbox API token](https://www.dropbox.com/developers)
- [rnpm](npm unlink) react native package manager

## clone the repository

This repository use `git submodule`, for first time clone

```sh
$ git clone --recursive -j8 https://github.com/wkh237/react-native-fetch-blob-dev.git
```

update submodules 

```sh
$ git submodule update --init --recursive
```

## run and install test app

Before install the test app, you should replace constants `DROPBOX_TOKEN` and `TEST_SERVER_URL` in `src/test/tests.js`

```diff
// replace this with your machine's IP, it can be "localhost:8123" when using simulator
+ const TEST_SERVER_URL = 'http://192.168.0.14:8123'                                                                                     
// replace this with your dropbox token
+ const DROPBOX_TOKEN = 'fsXcpmKPrHgAAAAAAAAAoXZhcXYWdgLpQMan6Tb_bzJ237DXhgQSev12hA-gUXt4'                                          
```

To generate test app template, simply execute `npm test <platform>` command from **root folder**.

```shell
$ npm test ios
# or
$ npm test android
```

The script will initialize a new RN app named `RNFetchBlobTest` (right in the project's `/RNFetchBlobTest` folder), it will also launch the test app by the `platform` given, and a nodejs server for test. You only need to run this script once.

## dev server

There is a test server for sending and receiving requests from test app, also it watches files in several directories and copy changed files to test app's folder. 

To install dev server modules, execute the following command from **root folder**

```shell
$ npm install 
```

To start dev server, go `test-server` folder and execute

```shell
$ node server
```

## work on android native code

After the test app installed, change `settings.gradle` in `RNFetchBlobTest/android/` 

```diff

rootProject.name = 'RNFetchBlobTest'

include ':app'
include ':react-native-fetch-blob'
// change this line so that the fetch-blob module in test app points to android project in src folder
- project(':react-native-fetch-blob').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-fetch-blob/android')                         
+ project(':react-native-fetch-blob').projectDir = new File(rootProject.projectDir, '../../src/android')                         

```

Now open the android project in `RNFetchBlobTest/android` folder with you IDE, every changes you made to `react-native-fetch-blob` project will directly maps to src folder.

**Always keep in mind, once you changed native code you have to recompile it otherwise it uses the same native executables.**

## work on ios native code

After the test app installed, open the `.xcodeproj` file inside `RNFetchBlobTest/ios` with XCode.

Delete existed `RNFetchBlob.xcodeproj` in `RNFetchBlobTest -> Libraries` since this one is the one in `RNFetchBlobTest/node_modules/react-native-fetch-blob/ios/` we're going to change its reference to `src/ios/RNFetchBlob.xcodeproj`.

Right click on `Libraries` select `add new files to "RNFetchBlobTest.xcodeproj" ..` and select `src/ios/RNFetchBlob.xcodeproj`. Now every changes you made to `RNFetchBlob` project will directly maps to the one in src folder.

Also, you have to add `CameraRoll` to the RNFetchBlobTest project otherwise the test case will crash the app.

**Always keep in mind, once you changed native code you have to recompile it otherwise it uses the same native executables.**
