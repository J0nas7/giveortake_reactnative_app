npm install:
    @reduxjs/toolkit react-redux redux-thunk
    react-native-splash-screen
    @react-navigation/native
    @react-navigation/stack
    axios

    i18next react-i18next i18next-http-backend 
    i18next-browser-languagedetector react-native-localize

    @react-native-async-storage/async-storage
    react-native-device-info react-native-notifications react-native-push-notification @react-native-firebase/messaging @react-native-firebase/app

    @react-native-picker/picker
    @react-navigation/bottom-tabs
    react-native-gesture-handler react-native-safe-area-context react-native-screens

    react-native-chart-kit
    react-native-qrcode-svg
    react-native-vision-camera
    react-native-worklets-core react-native-reanimated
    react-native-pdf react-native-blob-util react-native-webview
    
    --save-dev:
        babel-plugin-module-resolver
        @types/react-native-push-notification


Key: 
Team: 


## iOS repo-update:
pod install --repo-update
(objectVersion = 60)

## Android Studio couldn't find node?
## Should be run from a terminal window.
## If you are using Mac you can run Android Studio using this command in terminal. 
open -a /Applications/Android\ Studio.app

## Update JavaScript bundle for Android
npx react-native bundle --platform android --dev true --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/

## APK build for Android
./gradlew assembleRelease
=> android/app/build/outputs/apk/release/

## AAB build for Android
./gradlew bundleRelease

## macOS Play a sound after finishing a command:
&& afplay /System/Library/Sounds/Submarine.aiff -v 10

Versioning:
npm version patch/minor/major --no-git-tag-version
npx react-native-version

npm version
npx react-native --version

Xcode Derived Data:
~/Library/Developer/Xcode/DerivedData

Before AirDrop sharing:
rm -rf node_modules
rm -rf ios/Pods
rm -rf ios/build
rm -rf android/build
rm -rf android/app/build

