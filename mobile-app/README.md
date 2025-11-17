# 당뇨 케어 모바일 앱

당뇨병 조기 진단 및 케어를 위한 네이티브 모바일 애플리케이션입니다.

## ⚠️ 시작하기 전에

**이 폴더는 소스 코드만 포함하고 있습니다.**
Android/iOS 네이티브 폴더를 생성하려면 **[SETUP.md](./SETUP.md)** 파일을 반드시 확인하세요!

## 주요 기능

- **실시간 음식 감지**: YOLO 모델을 사용한 과일(바나나, 수박) 및 음료 감지
- **OCR 텍스트 인식**: PaddleOCR을 활용한 음료 라벨의 영양 성분표 읽기
- **당뇨 위험도 평가**: 감지된 음식의 당뇨 위험도 실시간 분석
- **칼로리 추정**: ArUco 마커 기반 크기 측정 및 칼로리 계산

## 빠른 시작

### 1. 백엔드 서버 실행

```bash
cd ../backend
docker-compose up --build
```

### 2. 모바일 앱 설정

**상세한 설정 방법은 [SETUP.md](./SETUP.md)를 참조하세요!**

간단 요약:
```bash
# React Native CLI 사용
npx react-native init DiabetesCareApp --version 0.72.6
# 소스 파일 복사 후
npm install
npm run android

# 또는 Expo 사용 (더 쉬움)
npx create-expo-app@latest DiabetesCareApp
# 소스 파일 복사 및 패키지 설치 후
npx expo start
```

## 기술 스택

- **React Native 0.72.6**: 크로스 플랫폼 네이티브 앱
- **React Navigation 6**: 네비게이션 관리
- **react-native-vision-camera**: 고성능 카메라 API
- **Axios**: HTTP 클라이언트

## 프로젝트 구조

```
mobile-app/
├── src/
│   ├── screens/          # 화면 컴포넌트
│   │   ├── HomeScreen.js
│   │   ├── CameraScreen.js
│   │   └── ResultScreen.js
│   ├── services/         # API 통신
│   │   └── api.js
│   └── styles/           # 디자인 시스템
│       └── theme.js
├── App.js
├── package.json
├── SETUP.md             # 🔥 프로젝트 초기화 가이드
└── README.md
```

## API 설정

`src/services/api.js`에서 백엔드 서버 URL을 설정하세요:

```javascript
// Android 에뮬레이터
const API_BASE_URL = 'http://10.0.2.2:8000';

// iOS 시뮬레이터
const API_BASE_URL = 'http://localhost:8000';

// 실제 디바이스 (컴퓨터의 IP 주소)
const API_BASE_URL = 'http://192.168.x.x:8000';
```

## 주요 화면

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
npm start -- --reset-cache
```

## 더 알아보기

- **프로젝트 초기화**: [SETUP.md](./SETUP.md)
- **메인 프로젝트**: [../README.md](../README.md)
- **버전 정보**: [../VERSIONS.md](../VERSIONS.md)

## 라이선스

이 프로젝트는 교육 및 연구 목적으로 개발되었습니다.
