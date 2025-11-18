# 아이콘 표시 문제 해결 가이드

React Native에서 아이콘이 제대로 표시되지 않는 경우 다음 단계를 따르세요.

## 문제 증상

- 아이콘 대신 물음표(?) 또는 빈 공간 표시
- Android/iOS에서 아이콘 폰트 로딩 실패
- 앱 실행 후 아이콘이 깨져서 보임

## 해결 방법

### 1. react-native.config.js 확인

프로젝트에 `react-native.config.js` 파일이 있는지 확인하세요. (이미 생성됨)

```javascript
module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./node_modules/react-native-vector-icons/Fonts'],
};
```

### 2. Android 설정

#### 2-1. 아이콘 폰트 자동 링크 (React Native 0.60+)

```bash
# mobile-app 디렉토리에서 실행
npx react-native-asset
```

이 명령어는 `react-native.config.js`에 정의된 폰트 파일을 자동으로 Android와 iOS 프로젝트에 복사합니다.

#### 2-2. 수동 설정 (자동 링크 실패 시)

**android/app/build.gradle**에 다음 추가:

```gradle
apply from: file("../../node_modules/react-native-vector-icons/fonts.gradle")
```

### 3. iOS 설정

#### 3-1. Pod 재설치

```bash
cd ios
pod install
cd ..
```

#### 3-2. Info.plist 확인 (필요 시)

**ios/YourApp/Info.plist**에 폰트 파일이 포함되어 있는지 확인:

```xml
<key>UIAppFonts</key>
<array>
  <string>MaterialCommunityIcons.ttf</string>
  <string>FontAwesome.ttf</string>
  <!-- 기타 사용하는 폰트 -->
</array>
```

### 4. 앱 재빌드

설정 변경 후 **반드시 앱을 완전히 재빌드**해야 합니다:

```bash
# Android
npm run android

# iOS
npm run ios
```

**중요**: Metro bundler 재시작만으로는 부족합니다. 네이티브 코드를 다시 컴파일해야 합니다.

### 5. 캐시 클리어 (문제 지속 시)

```bash
# Metro 캐시 클리어
npm start -- --reset-cache

# 또는
npx react-native start --reset-cache

# Android 빌드 캐시 클리어
cd android
./gradlew clean
cd ..

# iOS 빌드 캐시 클리어
cd ios
rm -rf ~/Library/Developer/Xcode/DerivedData
cd ..
```

### 6. 전체 재설치 (최후의 수단)

```bash
# 1. node_modules 삭제
rm -rf node_modules

# 2. 의존성 재설치
npm install

# 3. iOS Pod 재설치 (macOS만)
cd ios
pod deintegrate
pod install
cd ..

# 4. 앱 재빌드
npm run android  # 또는 npm run ios
```

## 테스트 방법

아이콘이 제대로 표시되는지 확인:

1. 홈 화면의 "food-apple" 아이콘 확인
2. "촬영 시작" 버튼의 카메라 아이콘 확인
3. 서버 상태 아이콘 (체크/X 마크) 확인

## 주의사항

- **android/ios 폴더가 없는 경우**: `SETUP.md`를 참고하여 React Native 프로젝트를 먼저 초기화하세요.
- **Expo 사용 시**: Expo Go 앱에서는 커스텀 네이티브 폰트가 지원되지 않을 수 있습니다. `expo prebuild`를 실행하여 네이티브 코드를 생성하세요.

## 사용 가능한 아이콘

이 앱은 **Material Community Icons**를 사용합니다.

- 전체 아이콘 목록: https://pictogrammers.com/library/mdi/
- 예제: `food-apple`, `camera`, `check-circle`, `close-circle`, `loading` 등

## 추가 리소스

- [react-native-vector-icons 공식 문서](https://github.com/oblador/react-native-vector-icons)
- [React Native Asset 도구](https://www.npmjs.com/package/react-native-asset)
