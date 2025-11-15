# 당뇨 케어 모바일 앱

당뇨병 조기 진단 및 케어를 위한 네이티브 모바일 애플리케이션입니다.

## 주요 기능

- **실시간 음식 감지**: YOLO 모델을 사용한 과일(바나나, 수박) 및 음료 감지
- **OCR 텍스트 인식**: PaddleOCR을 활용한 음료 라벨의 영양 성분표 읽기
- **당뇨 위험도 평가**: 감지된 음식의 당뇨 위험도 실시간 분석
- **칼로리 추정**: ArUco 마커 기반 크기 측정 및 칼로리 계산

## 기술 스택

### 모바일 앱
- **React Native 0.72.6**: 크로스 플랫폼 네이티브 앱 프레임워크
- **React Navigation 6**: 네비게이션 관리
- **react-native-vision-camera**: 고성능 카메라 API
- **Axios**: HTTP 클라이언트
- **React Native Linear Gradient**: 그라데이션 UI
- **React Native Vector Icons**: 아이콘

### 백엔드 API
- **FastAPI**: 고성능 Python 웹 프레임워크
- **Ultralytics YOLO**: 객체 감지 모델
- **PaddleOCR**: OCR 엔진
- **OpenCV**: 이미지 처리

## 설치 및 실행

### 1. 백엔드 서버 실행

```bash
# Docker Compose 사용
cd backend
docker-compose up --build

# 또는 직접 실행
cd ..
pip install -r backend/requirements.txt
python backend/app.py
```

백엔드 서버는 `http://localhost:8000`에서 실행됩니다.

### 2. 모바일 앱 설정

```bash
cd mobile-app

# 의존성 설치
npm install
# 또는
yarn install

# iOS Pod 설치 (macOS만 해당)
cd ios
pod install
cd ..
```

### 3. API URL 설정

`mobile-app/src/services/api.js` 파일에서 백엔드 서버 URL을 설정합니다:

```javascript
const API_BASE_URL = 'http://YOUR_SERVER_IP:8000';
```

- 로컬 테스트 (Android 에뮬레이터): `http://10.0.2.2:8000`
- 로컬 테스트 (iOS 시뮬레이터): `http://localhost:8000`
- 실제 디바이스: 서버의 실제 IP 주소 사용

### 4. 앱 실행

#### Android
```bash
npm run android
# 또는
yarn android
```

#### iOS (macOS만 가능)
```bash
npm run ios
# 또는
yarn ios
```

## 권한 설정

### Android (`android/app/src/main/AndroidManifest.xml`)
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.INTERNET" />
```

### iOS (`ios/DiabetesCareApp/Info.plist`)
```xml
<key>NSCameraUsageDescription</key>
<string>음식을 촬영하여 당뇨 위험도를 분석하기 위해 카메라가 필요합니다.</string>
```

## 프로젝트 구조

```
mobile-app/
├── App.js                      # 메인 앱 컴포넌트
├── index.js                    # 앱 진입점
├── package.json
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js       # 홈 화면
│   │   ├── CameraScreen.js     # 카메라 촬영 화면
│   │   └── ResultScreen.js     # 분석 결과 화면
│   ├── services/
│   │   └── api.js              # API 통신 로직
│   └── styles/
│       └── theme.js            # 디자인 시스템 (색상, 타이포그래피 등)
├── android/                    # Android 네이티브 코드
└── ios/                        # iOS 네이티브 코드
```

## 디자인 시스템

### 컬러 팔레트
- **Primary**: `#00BFA5` (청록색) - 메인 브랜드 컬러
- **Danger**: `#FF5252` (빨강) - 위험/경고
- **Warning**: `#FFC107` (노랑) - 주의
- **Success**: `#4CAF50` (녹색) - 안전

### 주요 화면

1. **홈 화면**: 앱 소개 및 기능 설명
2. **카메라 화면**: 실시간 카메라 뷰와 촬영 가이드
3. **결과 화면**:
   - 감지된 음식 종류
   - 당뇨 위험도 평가
   - 칼로리 정보
   - OCR 인식 텍스트
   - 영양 성분 분석 (음료인 경우)

## 문제 해결

### 카메라 권한 오류
- Android: 설정 > 앱 > 당뇨 케어 > 권한에서 카메라 권한 허용
- iOS: 설정 > 당뇨 케어 > 카메라 접근 허용

### 서버 연결 오류
- 백엔드 서버가 실행 중인지 확인
- API_BASE_URL이 올바르게 설정되었는지 확인
- 방화벽 설정 확인

### Metro Bundler 오류
```bash
# 캐시 삭제 후 재시작
npm start -- --reset-cache
```

## 라이선스

이 프로젝트는 교육 및 연구 목적으로 개발되었습니다.
