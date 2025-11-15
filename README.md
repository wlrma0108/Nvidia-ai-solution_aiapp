# 당뇨 케어 - AI 기반 음식 건강 영향 분석 시스템

당뇨병 조기 진단 및 케어를 위한 AI 기반 모바일 애플리케이션입니다. 카메라로 음식을 촬영하면 AI가 자동으로 음식을 인식하고, OCR로 영양 성분을 분석하여 당뇨 위험도를 실시간으로 알려줍니다.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10-blue.svg)
![React Native](https://img.shields.io/badge/react--native-0.72.6-blue.svg)

## 📋 목차

- [주요 기능](#주요-기능)
- [기술 아키텍처](#기술-아키텍처)
- [프로젝트 구조](#프로젝트-구조)
- [설치 및 실행](#설치-및-실행)
- [사용 방법](#사용-방법)
- [API 문서](#api-문서)
- [기술 상세](#기술-상세)

## 🎯 주요 기능

### 1. 실시간 음식 감지
- **YOLO 기반 객체 감지**: best.pt 모델을 사용한 과일(바나나, 수박) 감지
- **COCO YOLO**: 음료 용기(병, 컵, 잔) 감지
- **Kalman 필터 트래킹**: 실시간 환경에서 안정적인 객체 추적
- **디바운싱 및 재검증**: 깜빡임과 노이즈 문제 해결

### 2. OCR 텍스트 인식
- **PaddleOCR**: 한국어 텍스트 인식
- **음료 라벨 분석**: 영양 성분표 자동 읽기
- **다중 패딩 전략**: 최적의 OCR 결과를 위한 여러 크롭 시도

### 3. 당뇨 위험도 평가
- **실시간 위험도 분석**: 감지된 음식의 당뇨 위험도 즉시 표시
- **개인화된 메시지**: 각 음식별 맞춤형 경고 및 권장사항
- **영양 성분 기반 평가**: OCR로 추출한 당류, 탄수화물 등 분석

### 4. 칼로리 추정
- **ArUco 마커 기반 스케일 측정**: 정확한 크기 추정
- **자동 칼로리 계산**: 음식 종류와 크기에 따른 칼로리 추정

## 🏗 기술 아키텍처

### 전체 시스템 구조

```
┌─────────────────┐
│  Mobile App     │
│  (React Native) │
└────────┬────────┘
         │ HTTP/REST
         ↓
┌─────────────────┐
│  FastAPI Server │
│  (Python 3.10)  │
└────────┬────────┘
         │
    ┌────┴────┬─────────┬──────────┐
    ↓         ↓         ↓          ↓
┌────────┐ ┌─────┐ ┌────────┐ ┌──────────┐
│ YOLO   │ │ OCR │ │Tracking│ │ Calorie  │
│ best.pt│ │Paddle│ │Kalman │ │Estimation│
└────────┘ └─────┘ └────────┘ └──────────┘
```

### 기술 스택

#### 백엔드 (Python)
- **FastAPI**: 고성능 비동기 웹 프레임워크
- **Ultralytics YOLO**: 객체 감지 (best.pt + yolov8n.pt)
- **PaddleOCR**: 한국어 OCR 엔진
- **OpenCV**: 이미지 처리 및 ArUco 마커 감지
- **NumPy**: 수치 계산 및 Kalman 필터

#### 프론트엔드 (React Native)
- **React Native 0.72.6**: 크로스 플랫폼 네이티브 앱
- **React Navigation**: 화면 네비게이션
- **react-native-vision-camera**: 고성능 카메라 API
- **Axios**: HTTP 클라이언트
- **React Native Linear Gradient**: 그라데이션 UI

## 📁 프로젝트 구조

```
Nvidia-ai-solution_aiapp/
├── backend/                    # FastAPI 백엔드
│   ├── app.py                 # FastAPI 앱 메인
│   ├── requirements.txt       # Python 의존성
│   ├── Dockerfile            # Docker 설정
│   └── docker-compose.yml    # Docker Compose 설정
│
├── mobile-app/                # React Native 앱
│   ├── src/
│   │   ├── screens/          # 화면 컴포넌트
│   │   │   ├── HomeScreen.js
│   │   │   ├── CameraScreen.js
│   │   │   └── ResultScreen.js
│   │   ├── services/         # API 통신
│   │   │   └── api.js
│   │   └── styles/           # 디자인 시스템
│   │       └── theme.js
│   ├── App.js
│   └── package.json
│
├── best.pt                    # YOLO 학습 모델
├── config.py                  # 설정 (Windows)
├── config_linux.py           # 설정 (Linux/Docker)
├── detection.py              # 객체 감지 로직
├── tracking.py               # Kalman 트래킹
├── ocr_utils.py             # OCR 및 영양 분석
├── calorie.py               # 칼로리 추정
├── models.py                # 모델 로드
├── main.py                  # 데스크탑 버전 (OpenCV)
└── README.md
```

## 🚀 설치 및 실행

### 사전 요구사항

- **Python 3.10+**
- **Node.js 16+**
- **React Native 개발 환경** ([공식 가이드](https://reactnative.dev/docs/environment-setup))
- **Docker** (선택사항)

### 1. 저장소 클론

```bash
git clone https://github.com/wlrma0108/Nvidia-ai-solution_aiapp.git
cd Nvidia-ai-solution_aiapp
```

### 2. 백엔드 서버 실행

#### Option A: Docker 사용 (권장)

```bash
cd backend
docker-compose up --build
```

#### Option B: 직접 실행

```bash
# 의존성 설치
pip install -r backend/requirements.txt

# 서버 실행
python backend/app.py
```

서버는 `http://localhost:8000`에서 실행됩니다.

API 문서: `http://localhost:8000/docs`

### 3. 모바일 앱 설정 및 실행

```bash
cd mobile-app

# 의존성 설치
npm install
# 또는
yarn install

# iOS Pod 설치 (macOS만)
cd ios && pod install && cd ..

# API URL 설정
# src/services/api.js 파일에서 API_BASE_URL 수정

# Android 실행
npm run android

# iOS 실행 (macOS만)
npm run ios
```

## 📱 사용 방법

### 1. 홈 화면
- 앱 기능 소개 확인
- 서버 상태 확인
- "촬영 시작" 버튼 클릭

### 2. 카메라 화면
- 음식이나 음료를 화면 중앙에 배치
- 촬영 버튼 클릭
- AI가 자동으로 분석 시작

### 3. 결과 화면
- **감지된 음식**: 음식 종류와 신뢰도 표시
- **당뇨 위험도**: 색상 코드로 위험도 표시
  - 🔴 빨강: 높은 위험 (바나나, 수박)
  - 🟡 노랑: 주의 필요 (음료)
  - 🟢 녹색: 안전
- **칼로리 정보**: 예상 중량 및 칼로리
- **OCR 결과**: 인식된 텍스트
- **영양 분석**: 음료인 경우 상세 영양 평가

## 📖 API 문서

### POST `/analyze`

음식 이미지를 분석합니다.

**요청**
```http
POST /analyze HTTP/1.1
Content-Type: multipart/form-data

file: [이미지 파일]
```

**응답**
```json
{
  "detected": true,
  "food_type": "Banana",
  "food_class": 0,
  "confidence": 0.92,
  "risk_message": "바나나는 당지수가 높아서 혈당을 빠르게 올릴 수 있습니다.",
  "ocr_texts": ["텍스트1", "텍스트2"],
  "nutrition_analysis": "영양 분석 결과...",
  "calorie_info": {
    "grams": 118.0,
    "kcal": 105.0,
    "scale_detected": false
  }
}
```

### GET `/health`

서버 상태를 확인합니다.

**응답**
```json
{
  "status": "healthy"
}
```

## 🔬 기술 상세

### 객체 감지 파이프라인

1. **Detection (detection.py)**
   - YOLO best.pt: 과일 감지
   - YOLO COCO: 음료 용기 감지
   - Aspect ratio & 면적 필터링

2. **Tracking (tracking.py)**
   - Kalman Filter 기반 2D 위치 추적
   - IOU 매칭으로 객체 연결
   - EMA (Exponential Moving Average) 신뢰도 계산

3. **Verification**
   - 디바운싱: 연속 프레임에서 안정성 확인
   - 재검증: Crop 후 재감지로 정확도 향상
   - Cooldown: 잘못된 감지 후 대기 시간

### OCR 및 영양 분석

1. **텍스트 추출 (ocr_utils.py)**
   - 다중 패딩 전략 (20px, 60px, 120px)
   - 이미지 스케일업 (최소 256px)
   - 거울 모드 복원

2. **영양 성분 분석**
   - 정규식 기반 수치 파싱 (당류, 탄수화물, 트랜스지방)
   - 키워드 기반 음료 분류
   - 당뇨 위험도 자동 평가

### 칼로리 추정

1. **스케일 측정 (calorie.py)**
   - ArUco 마커 감지
   - cm/px 비율 계산

2. **칼로리 계산**
   - 객체 크기 × 밀도 × 형태 계수
   - 음식별 100g 당 칼로리 기준

## 🎨 디자인 시스템

### 컬러 팔레트
- **Primary**: `#00BFA5` - 청록색 (의료/헬스케어)
- **Accent**: `#00ACC1` - 강조색
- **Danger**: `#FF5252` - 위험/경고
- **Warning**: `#FFC107` - 주의
- **Success**: `#4CAF50` - 안전

### UI 원칙
- **간결함**: 필요한 정보만 명확하게
- **가독성**: 큰 폰트와 충분한 여백
- **직관성**: 색상으로 위험도 즉시 파악
- **접근성**: 고대비 색상 사용

## 📊 개발 히스토리

처음에는 정적 이미지 OCR(DrugDetection)과 단순 과일 YOLO 감지에서 출발했으나,
실시간 환경에서의 노이즈·깜빡임 문제를 Kalman 기반 트래킹과 디바운싱, 재검증으로 해결하고,
이후 COCO YOLO와 PaddleOCR를 결합해 과일과 음료를 동시에 다루는 멀티모달 구조로 확장하였습니다.

최종적으로는 detection, tracking, OCR, 칼로리 추정을 개별 모듈로 분리한 아키텍처를 구성하여,
한 번의 카메라 촬영으로 이미지와 라벨 텍스트를 함께 분석하고,
당뇨 위험도와 칼로리를 설명할 수 있는 수준까지 고도화하였습니다.

## 🤝 기여

이 프로젝트는 교육 및 연구 목적으로 개발되었습니다.

## 📄 라이선스

MIT License

## 👥 개발자

- GitHub: [@wlrma0108](https://github.com/wlrma0108)

## 🙏 감사의 말

- NVIDIA AI 솔루션 과정
- Ultralytics YOLO
- PaddleOCR
- React Native 커뮤니티

---

**Note**: 이 앱은 의료 기기가 아니며, 전문적인 의료 상담을 대체할 수 없습니다. 당뇨병 관리는 반드시 의료 전문가와 상담하시기 바랍니다.