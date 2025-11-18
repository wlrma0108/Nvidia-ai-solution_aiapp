# React Native Vector Icons 완전 설정 가이드

## 문제: 아이콘이 물음표(?) 또는 빈 박스로 표시됨

이 가이드는 아이콘이 제대로 표시되지 않는 문제를 **완전히 해결**합니다.

---

## 🚀 빠른 해결 방법 (권장)

### Windows:
```cmd
cd mobile-app
setup-icons.bat
```

### macOS/Linux:
```bash
cd mobile-app
./setup-icons.sh
```

스크립트가 자동으로 아이콘 폰트를 링크합니다.

---

## 📋 수동 설정 (스크립트 실패 시)

### 1단계: 현재 상태 확인

```bash
cd mobile-app
ls android  # 또는 dir android (Windows)
ls ios      # 또는 dir ios (Windows)
```

**android/ios 폴더가 없다면:**
```bash
# Option A: React Native CLI (권장)
npx react-native init TempApp
# 생성된 TempApp/android 와 TempApp/ios 폴더를 mobile-app/으로 복사

# Option B: Expo
npx expo prebuild
```

### 2단계: react-native-asset 설치

```bash
# 전역 설치 (권장)
npm install -g react-native-asset

# 또는 프로젝트에 설치
npm install --save-dev react-native-asset
```

### 3단계: 아이콘 폰트 링크

```bash
# mobile-app 디렉토리에서 실행
npx react-native-asset
```

**성공 메시지 확인:**
```
✔ Assets have been successfully linked
```

### 4단계: 앱 완전 재빌드

**중요**: Metro bundler 재시작만으로는 부족합니다!

```bash
# Android
npm run android

# iOS (macOS만)
cd ios
pod install
cd ..
npm run ios
```

---

## 🔧 문제 해결

### 문제 1: "command not found: react-native-asset"

```bash
# npx를 사용하세요 (자동으로 설치됨)
npx react-native-asset
```

### 문제 2: "No android/ios directories found"

android/ios 폴더가 없습니다. 다음 중 하나를 선택하세요:

**방법 A - React Native CLI (권장):**
```bash
# 1. 새 프로젝트 생성
npx react-native init TempProject

# 2. 생성된 폴더 복사
cp -r TempProject/android ./mobile-app/
cp -r TempProject/ios ./mobile-app/

# 3. 임시 프로젝트 삭제
rm -rf TempProject

# 4. 아이콘 폰트 링크
cd mobile-app
npx react-native-asset
```

**방법 B - Expo:**
```bash
cd mobile-app
npx expo prebuild
npx react-native-asset
```

### 문제 3: Android에서 아이콘이 여전히 깨짐

**android/app/build.gradle** 파일 수정:

```gradle
apply from: "../../node_modules/react-native/react.gradle"

// 이 줄 추가
apply from: file("../../node_modules/react-native-vector-icons/fonts.gradle")
```

그 후:
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### 문제 4: iOS에서 아이콘이 여전히 깨짐

**ios/YourApp/Info.plist** 확인:

```xml
<key>UIAppFonts</key>
<array>
  <string>MaterialCommunityIcons.ttf</string>
</array>
```

없다면 추가 후:
```bash
cd ios
pod install
cd ..
npm run ios
```

### 문제 5: 빌드 후에도 아이콘 깨짐

**완전 클린 빌드:**

```bash
# 1. Metro 캐시 클리어
npm start -- --reset-cache

# 2. Android 클린
cd android
./gradlew clean
cd ..

# 3. iOS 클린 (macOS)
cd ios
rm -rf ~/Library/Developer/Xcode/DerivedData
pod deintegrate
pod install
cd ..

# 4. node_modules 재설치
rm -rf node_modules
npm install

# 5. 아이콘 재링크
npx react-native-asset

# 6. 앱 재빌드
npm run android  # 또는 npm run ios
```

---

## ✅ 아이콘 작동 확인

앱을 실행한 후 다음을 확인하세요:

1. **홈 화면**: `food-apple` 아이콘 (사과 모양)
2. **카메라 화면**: `camera` 아이콘
3. **서버 상태**: `check-circle` 또는 `close-circle` 아이콘

**모두 제대로 보인다면 성공!** ✨

---

## 📦 package.json 자동화

`package.json`에 postinstall 스크립트가 이미 추가되어 있습니다:

```json
{
  "scripts": {
    "postinstall": "npx react-native-asset || echo 'Skipping...'"
  }
}
```

이제 `npm install` 할 때마다 자동으로 아이콘 폰트가 링크됩니다!

---

## 🆘 여전히 안 된다면

1. **react-native.config.js** 파일 확인:
   ```javascript
   module.exports = {
     assets: ['./node_modules/react-native-vector-icons/Fonts'],
   };
   ```

2. **사용 중인 아이콘 확인**:
   - 이 앱은 **Material Community Icons** 사용
   - 전체 목록: https://pictogrammers.com/library/mdi/
   - 예: `food-apple`, `camera`, `check-circle`, `close-circle`

3. **GitHub Issue 검색**:
   - https://github.com/oblador/react-native-vector-icons/issues

---

## 💡 대안: Expo Icons 사용

React Native CLI 대신 Expo를 사용한다면:

```bash
# Expo Icons 설치
npx expo install @expo/vector-icons

# 아이콘 사용법 변경
import { MaterialCommunityIcons } from '@expo/vector-icons';

// 기존
<Icon name="food-apple" size={80} color="#FFF" />

// 변경
<MaterialCommunityIcons name="food-apple" size={80} color="#FFF" />
```

---

## 📞 추가 도움이 필요하면

- React Native Vector Icons 공식 문서: https://github.com/oblador/react-native-vector-icons
- React Native 공식 문서: https://reactnative.dev/docs/getting-started
