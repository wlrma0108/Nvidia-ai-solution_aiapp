# React Native 프로젝트 초기화 가이드

## ⚠️ 중요: 네이티브 프로젝트 생성 필요

현재 소스 코드는 준비되어 있지만, Android와 iOS 네이티브 폴더가 없습니다.
아래 단계를 따라 프로젝트를 완전히 설정하세요.

## 🚀 빠른 시작

### 방법 1: React Native CLI (권장)

```bash
# 1. 새 React Native 프로젝트 생성
cd ..
npx react-native init DiabetesCareApp --version 0.72.6

# 2. 우리 소스 파일 복사
cd DiabetesCareApp
cp -r ../Nvidia-ai-solution_aiapp/mobile-app/src ./
cp ../Nvidia-ai-solution_aiapp/mobile-app/App.js ./
cp ../Nvidia-ai-solution_aiapp/mobile-app/package.json ./package.json.new

# 3. package.json 병합 (dependencies만 복사)
# package.json.new의 dependencies를 package.json에 수동으로 추가

# 4. 의존성 설치
npm install

# 5. iOS Pod 설치 (macOS만)
cd ios && pod install && cd ..

# 6. 실행
npm run android  # Android
npm run ios      # iOS (macOS만)
```

### 방법 2: Expo (더 쉬움, 권장)

```bash
# 1. Expo 프로젝트 생성
cd ..
npx create-expo-app@latest DiabetesCareApp --template blank

# 2. React Navigation 및 카메라 설정
cd DiabetesCareApp
npx expo install expo-camera
npx expo install @react-navigation/native @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context
npx expo install react-native-gesture-handler react-native-reanimated
npx expo install expo-linear-gradient
npx expo install axios

# 3. 우리 소스 복사
cp -r ../Nvidia-ai-solution_aiapp/mobile-app/src ./
cp ../Nvidia-ai-solution_aiapp/mobile-app/App.js ./

# 4. 실행
npx expo start
```

## 📋 필요한 권한 설정

### Android (`android/app/src/main/AndroidManifest.xml`)
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.INTERNET" />
```

### iOS (`ios/DiabetesCareApp/Info.plist`)
```xml
<key>NSCameraUsageDescription</key>
<string>음식을 촬영하여 당뇨 위험도를 분석하기 위해 카메라가 필요합니다.</string>
<key>NSMicrophoneUsageDescription</key>
<string>카메라 사용에 필요합니다.</string>
```

## 🔧 API 서버 설정

`src/services/api.js`에서 API URL을 수정하세요:

```javascript
// 로컬 테스트
const API_BASE_URL = 'http://10.0.2.2:8000';  // Android 에뮬레이터
const API_BASE_URL = 'http://localhost:8000';  // iOS 시뮬레이터
const API_BASE_URL = 'http://YOUR_IP:8000';    // 실제 디바이스
```

## 📦 전체 프로젝트 구조

```
DiabetesCareApp/
├── android/              # Android 네이티브 (자동 생성됨)
├── ios/                  # iOS 네이티브 (자동 생성됨)
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── CameraScreen.js
│   │   └── ResultScreen.js
│   ├── services/
│   │   └── api.js
│   └── styles/
│       └── theme.js
├── App.js
├── package.json
├── babel.config.js
├── metro.config.js
└── index.js
```

## 🐛 문제 해결

### Metro Bundler 오류
```bash
npm start -- --reset-cache
```

### Gradle 오류 (Android)
```bash
cd android
./gradlew clean
cd ..
```

### Pod 오류 (iOS)
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### react-native-vision-camera 설정

#### Android (`android/app/build.gradle`)
```gradle
android {
    ...
    defaultConfig {
        ...
        missingDimensionStrategy 'react-native-camera', 'general'
    }
}
```

#### iOS
```bash
cd ios
pod install
```

## 📱 실행

```bash
# Android
npm run android

# iOS (macOS만)
npm run ios

# Metro Bundler 별도 실행
npm start
```

## 🔗 백엔드 서버 실행

모바일 앱 실행 전 백엔드 서버를 먼저 시작하세요:

```bash
cd ../backend
docker-compose up --build
```

서버: http://localhost:8000

## 📚 더 많은 정보

- [React Native 공식 문서](https://reactnative.dev)
- [Expo 문서](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org)
- [Vision Camera](https://react-native-vision-camera.com)

## 💡 추천 방법

**처음 시작하는 경우**: Expo 사용 (방법 2)
**네이티브 모듈 필요한 경우**: React Native CLI (방법 1)
