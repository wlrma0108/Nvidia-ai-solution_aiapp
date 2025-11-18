# 당뇨 케어 - AI 기반 음식 건강 영향 분석 시스템

당뇨병 조기 진단 및 케어를 위한 AI 기반 모바일 애플리케이션입니다. 카메라로 음식을 촬영하면 AI가 자동으로 음식을 인식하고, OCR로 영양 성분을 분석하여 당뇨 위험도를 실시간으로 알려줍니다.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10-blue.svg)
![React Native](https://img.shields.io/badge/react--native-0.72.6-blue.svg)

## 📋 목차

- [주요 기능](#주요-기능)
- [기술 아키텍처](#기술-아키텍처)
- [프로젝트 구조](#프로젝트-구조)
- [환경 설정 가이드](#환경-설정-가이드)
- [설치 및 실행](#설치-및-실행)
- [VSCode에서 개발하기](#vscode에서-개발하기)
- [테스트 방법](#테스트-방법)
- [사용 방법](#사용-방법)
- [API 문서](#api-문서)
- [트러블슈팅](#트러블슈팅)
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
│   ├── requirements.txt       # Python 의존성 (버전 고정)
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
│   │   │   └── api.js       # ⚠️ API_BASE_URL 설정 필요
│   │   └── styles/           # 디자인 시스템
│   │       └── theme.js
│   ├── App.js
│   ├── package.json          # 의존성 버전 고정
│   └── SETUP.md             # React Native 초기 설정 가이드
│
├── best.pt                    # YOLO 학습 모델 (필수)
├── config.py                  # 설정 (Docker/Windows 자동 감지)
├── detection.py              # 객체 감지 로직
├── tracking.py               # Kalman 트래킹
├── ocr_utils.py             # OCR 및 영양 분석
├── calorie.py               # 칼로리 추정
├── models.py                # 모델 Lazy Loading
├── main.py                  # 데스크탑 버전 (OpenCV)
├── DrugDetection.py         # OCR 단독 테스트 스크립트
├── .nvmrc                   # Node.js 버전 (18.18.0)
├── .python-version          # Python 버전 (3.10.13)
├── VERSIONS.md             # 의존성 버전 문서
└── README.md
```

## ⚙️ 환경 설정 가이드

### 1. 백엔드 환경 변수 설정

`config.py` 파일은 **Docker와 Windows 환경을 자동으로 감지**합니다. 추가 설정이 필요한 경우:

#### 1-1. 환경 변수 (선택사항)

```bash
# Linux/Docker 환경
export PADDLE_HOME=/app/.paddle_cache
export FRUIT_MODEL_PATH=/app/best.pt
export COCO_MODEL_PATH=yolov8n.pt

# Windows 환경 (PowerShell)
$env:FRUIT_MODEL_PATH="C:\path\to\best.pt"
```

#### 1-2. Docker Compose 환경 변수

`backend/docker-compose.yml` 파일에서 수정 가능:

```yaml
environment:
  - PADDLE_HOME=/app/.paddle_cache  # PaddleOCR 캐시 디렉토리
  - HOME=/app
  - PYTHONUNBUFFERED=1
  - FRUIT_MODEL_PATH=/app/best.pt  # 과일 YOLO 모델 경로
  - COCO_MODEL_PATH=yolov8n.pt     # 음료 YOLO 모델 경로
```

**주의**: Docker 환경에서는 기본값으로 잘 작동하므로 수정할 필요 없습니다.

### 2. 프론트엔드 API URL 설정 (필수)

`mobile-app/src/services/api.js` 파일의 API URL을 환경에 맞게 수정:

#### 2-1. 로컬 서버 연결 (개발 환경)

```javascript
// mobile-app/src/services/api.js
const API_BASE_URL = 'http://localhost:8000';  // ❌ 실제 기기에서 작동 안 함
```

#### 2-2. 실제 기기 연결 (권장)

**Android 에뮬레이터:**
```javascript
const API_BASE_URL = 'http://10.0.2.2:8000';
```

**iOS 시뮬레이터:**
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

**실제 Android/iOS 기기 (WiFi 연결):**
```javascript
// 개발 PC의 로컬 IP 주소로 변경
const API_BASE_URL = 'http://192.168.0.10:8000';
```

**로컬 IP 확인 방법:**
```bash
# Windows
ipconfig

# macOS/Linux
ifconfig
# 또는
ip addr show
```

WiFi 네트워크에서 `192.168.x.x` 형태의 IPv4 주소를 찾아 사용하세요.

#### 2-3. 프로덕션 환경

```javascript
const API_BASE_URL = 'https://your-api-server.com';
```

### 3. 모델 파일 확인

**필수 파일:**
- `best.pt` - 과일 감지용 YOLO 모델 (프로젝트 루트에 위치)
- `yolov8n.pt` - 음료 감지용 COCO 모델 (자동 다운로드)

`best.pt` 파일이 없으면 백엔드가 모델 로딩 시점에 오류를 발생시킵니다.

## 🚀 설치 및 실행

### 사전 요구사항

**필수:**
- **Python 3.10.13** (정확한 버전 권장)
- **Node.js 18.18.0** (정확한 버전 권장)
- **npm 8.0.0+**

**선택사항:**
- **Docker & Docker Compose** (백엔드 실행 시 권장)
- **Android Studio** (Android 개발 시)
- **Xcode** (iOS 개발 시, macOS 전용)

### Step 1: 저장소 클론

```bash
git clone https://github.com/wlrma0108/Nvidia-ai-solution_aiapp.git
cd Nvidia-ai-solution_aiapp
```

### Step 2: 백엔드 서버 실행

#### 방법 A: Docker 사용 (권장)

```bash
# 1. backend 디렉토리로 이동
cd backend

# 2. Docker Compose로 빌드 및 실행
docker-compose up --build

# 백그라운드 실행 (터미널 유지 불필요)
docker-compose up -d --build

# 로그 확인
docker-compose logs -f
```

**서버 확인:**
- API: http://localhost:8000
- API 문서: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

**Docker 중지:**
```bash
docker-compose down
```

#### 방법 B: 로컬 직접 실행

```bash
# 1. Python 가상환경 생성 (권장)
python -m venv venv

# 2. 가상환경 활성화
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 3. 의존성 설치
pip install -r backend/requirements.txt

# 4. 서버 실행 (프로젝트 루트에서)
cd backend
python app.py

# 또는 uvicorn 직접 실행
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

**서버 확인:**
```bash
curl http://localhost:8000/health
```

예상 응답:
```json
{"status": "healthy"}
```

### Step 3: 모바일 앱 설정 및 실행

#### 3-1. 의존성 설치

```bash
cd mobile-app

# npm 사용
npm install

# 또는 yarn 사용
yarn install
```

#### 3-2. API URL 설정 (필수)

`src/services/api.js` 파일 수정:

```javascript
// 개발 환경에 맞게 선택
const API_BASE_URL = 'http://10.0.2.2:8000';  // Android 에뮬레이터
// const API_BASE_URL = 'http://192.168.0.10:8000';  // 실제 기기
```

#### 3-3. React Native 환경 설정

**처음 실행하는 경우** `SETUP.md` 가이드를 참고하여 Android/iOS 프로젝트를 초기화하세요:

```bash
# React Native CLI 사용 (권장)
npx react-native init MyApp
# 생성된 android/ios 폴더를 mobile-app으로 복사

# 또는 Expo 사용
npx expo init MyApp --template bare-workflow
```

자세한 내용은 `mobile-app/SETUP.md`를 참고하세요.

#### 3-4. iOS Pod 설치 (macOS만)

```bash
cd ios
pod install
cd ..
```

#### 3-5. 앱 실행

**Android:**
```bash
# Android 에뮬레이터 또는 연결된 기기에서 실행
npm run android

# 또는
npx react-native run-android
```

**iOS (macOS만):**
```bash
npm run ios

# 또는
npx react-native run-ios
```

**Metro 번들러 시작 (별도 터미널):**
```bash
npm start
```

## 💻 VSCode에서 개발하기

프로젝트에는 VSCode 통합 개발 환경을 위한 설정이 포함되어 있습니다. VSCode를 사용하면 버튼 클릭만으로 서버 실행, 앱 빌드, 디버깅 등을 수행할 수 있습니다.

### VSCode 설정 파일

프로젝트 루트의 `.vscode/` 폴더에 다음 설정이 포함되어 있습니다:

- **`tasks.json`**: 자주 사용하는 작업들을 Task로 정의
- **`launch.json`**: 디버깅 설정

### 📋 사용 가능한 Tasks

VSCode에서 `Ctrl+Shift+P` (macOS: `Cmd+Shift+P`)를 누르고 `Tasks: Run Task`를 선택하면 다음 작업들을 실행할 수 있습니다:

#### 백엔드 관련

| Task 이름 | 설명 | 단축키 |
|-----------|------|--------|
| **FastAPI: 서버 시작 (개발)** | uvicorn으로 개발 서버 시작 (hot reload) | - |
| **FastAPI: 서버 시작 (Docker)** | Docker Compose로 서버 시작 | - |
| **Docker: 이미지 빌드** | Docker 이미지 빌드 | - |
| **Docker: 컨테이너 실행** | 빌드된 이미지로 컨테이너 실행 | - |
| **카메라 Detection 테스트** | main.py 실행 (로컬 카메라로 테스트) | - |

#### 프론트엔드 (React Native) 관련

| Task 이름 | 설명 | 단축키 |
|-----------|------|--------|
| **React Native: Metro 번들러 시작** | Metro 개발 서버 시작 | - |
| **React Native: Android 앱 실행** | Android 앱 빌드 및 실행 | - |
| **React Native: iOS 앱 실행** | iOS 앱 빌드 및 실행 (macOS만) | - |
| **React Native: 캐시 클리어 후 시작** | Metro 캐시를 지우고 재시작 | - |
| **Android: Clean Build** | Gradle 캐시 클리어 후 재빌드 | - |

#### 아이콘 설정

| Task 이름 | 설명 |
|-----------|------|
| **아이콘 설정 (Linux/macOS)** | setup-icons.sh 실행 |
| **아이콘 설정 (Windows)** | setup-icons.bat 실행 |

#### 의존성 설치

| Task 이름 | 설명 |
|-----------|------|
| **의존성 설치: Python** | requirements.txt 설치 |
| **의존성 설치: React Native** | npm install 실행 |
| **의존성 설치: 전체** | Python + React Native 한번에 설치 |

### 🐛 디버깅 설정

VSCode의 디버깅 기능을 사용하려면 `F5` 키를 누르거나 왼쪽 사이드바의 디버그 아이콘을 클릭합니다.

#### 사용 가능한 디버그 설정

| 설정 이름 | 설명 | 사용 시점 |
|-----------|------|-----------|
| **FastAPI: 디버그 모드** | FastAPI 서버를 디버그 모드로 실행 | API 개발 및 버그 수정 시 |
| **카메라 Detection: 디버그** | main.py를 디버그 모드로 실행 | 카메라 detection 로직 디버깅 |
| **Python: 현재 파일 디버그** | 현재 열려있는 Python 파일 실행 | 개별 스크립트 테스트 |
| **OCR Detection 테스트** | DrugDetection.py 디버그 실행 | OCR 기능 테스트 |

#### 디버깅 기본 사용법

1. **중단점 설정**: 코드 라인 번호 왼쪽을 클릭하여 빨간 점 표시
2. **디버깅 시작**: `F5` 또는 상단의 디버그 설정 선택 후 시작
3. **변수 확인**: 왼쪽 사이드바에서 현재 변수 값 확인
4. **단계별 실행**:
   - `F10`: Step Over (다음 줄로)
   - `F11`: Step Into (함수 내부로)
   - `Shift+F11`: Step Out (함수 밖으로)
   - `F5`: Continue (다음 중단점까지)

### 🚀 빠른 시작 가이드

#### 1. 백엔드 개발 시작하기

```
1. Ctrl+Shift+P → "Tasks: Run Task"
2. "FastAPI: 서버 시작 (개발)" 선택
3. 서버가 시작되면 http://localhost:8000/docs 접속
```

또는 디버그 모드로:
```
1. F5 누르기
2. "FastAPI: 디버그 모드" 선택
3. 중단점 설정 후 API 호출하여 디버깅
```

#### 2. React Native 앱 개발하기

**Android:**
```
1. Ctrl+Shift+P → "Tasks: Run Task"
2. "React Native: Android 앱 실행" 선택
   (Metro 번들러도 자동으로 시작됩니다)
3. 에뮬레이터 또는 실제 기기에서 앱 확인
```

**iOS (macOS만):**
```
1. Ctrl+Shift+P → "Tasks: Run Task"
2. "React Native: iOS 앱 실행" 선택
3. 시뮬레이터에서 앱 확인
```

#### 3. 아이콘 문제 해결

```
1. Ctrl+Shift+P → "Tasks: Run Task"
2. "아이콘 설정 (Linux/macOS)" 또는 "아이콘 설정 (Windows)" 선택
3. 스크립트가 자동으로 아이콘 폰트 링크
4. 앱 재빌드
```

#### 4. 카메라 Detection 로컬 테스트

```
1. 웹캠 연결 확인
2. Ctrl+Shift+P → "Tasks: Run Task"
3. "카메라 Detection 테스트" 선택
4. 카메라 화면에서 과일/음료 인식 테스트
```

### 🔧 Task 단축키 설정하기

자주 사용하는 Task에 단축키를 지정할 수 있습니다:

1. `Ctrl+Shift+P` → "Preferences: Open Keyboard Shortcuts (JSON)" 선택
2. 다음과 같이 단축키 추가:

```json
[
  {
    "key": "ctrl+shift+b",
    "command": "workbench.action.tasks.runTask",
    "args": "FastAPI: 서버 시작 (개발)"
  },
  {
    "key": "ctrl+shift+r",
    "command": "workbench.action.tasks.runTask",
    "args": "React Native: Android 앱 실행"
  }
]
```

### 💡 VSCode 확장 프로그램 추천

다음 확장 프로그램을 설치하면 개발이 더 편리합니다:

#### 필수
- **Python** (ms-python.python) - Python 개발 지원
- **Pylance** (ms-python.vscode-pylance) - Python 인텔리센스
- **React Native Tools** (msjsdiag.vscode-react-native) - React Native 디버깅
- **ES7+ React/Redux/React-Native snippets** - React 코드 스니펫

#### 권장
- **Docker** (ms-azuretools.vscode-docker) - Docker 관리
- **REST Client** (humao.rest-client) - API 테스트
- **GitLens** (eamodio.gitlens) - Git 기능 강화
- **Error Lens** (usernamehw.errorlens) - 인라인 에러 표시

### 📝 VSCode 터미널 활용

VSCode 내장 터미널(`Ctrl+\``)에서도 모든 명령어를 실행할 수 있습니다:

```bash
# 백엔드 서버 시작
cd backend && python app.py

# React Native 앱 실행
cd mobile-app && npm run android

# 아이콘 설정
cd mobile-app && ./setup-icons.sh

# 카메라 테스트
python main.py
```

## 🧪 테스트 방법

### 1. 백엔드 API 테스트

#### 1-1. Health Check 테스트

```bash
curl http://localhost:8000/health
```

예상 결과:
```json
{"status": "healthy"}
```

#### 1-2. 이미지 분석 테스트 (curl)

```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/image.jpg"
```

예상 결과:
```json
{
  "detected": true,
  "food_type": "Banana",
  "food_class": 0,
  "confidence": 0.92,
  "risk_message": "바나나는 당지수가 높아서...",
  "ocr_texts": [],
  "nutrition_analysis": null,
  "calorie_info": {
    "grams": 118.0,
    "kcal": 105.0,
    "scale_detected": false
  }
}
```

#### 1-3. Postman/Thunder Client 테스트

1. **POST** 요청 생성: `http://localhost:8000/analyze`
2. **Body** 탭 → **form-data** 선택
3. Key: `file`, Type: `File`, Value: 이미지 파일 선택
4. **Send** 클릭

#### 1-4. Swagger UI 테스트 (가장 간단)

브라우저에서 http://localhost:8000/docs 접속:
1. `/analyze` 엔드포인트 클릭
2. "Try it out" 버튼 클릭
3. 이미지 파일 업로드
4. "Execute" 버튼 클릭
5. 결과 확인

### 2. OCR 단독 테스트

```bash
# 이미지 경로를 인자로 전달
python DrugDetection.py /path/to/drink_label.jpg

# 환경 변수로 기본 경로 설정
export DEFAULT_IMG_PATH=/path/to/image.jpg
python DrugDetection.py
```

### 3. 데스크탑 버전 테스트 (OpenCV)

```bash
# 웹캠으로 실시간 감지
python main.py

# 종료: 'q' 키 누르기
```

### 4. 모바일 앱 테스트

#### 4-1. 서버 연결 확인
1. 앱 실행
2. 홈 화면에서 서버 상태 확인 (초록색: 정상, 빨간색: 오류)
3. 상태가 오프라인이면 API URL을 확인하세요

#### 4-2. 음식 감지 테스트
1. "촬영 시작" 버튼 클릭
2. 카메라 권한 허용
3. 바나나, 수박, 또는 음료 라벨을 촬영
4. 결과 화면 확인

#### 4-3. 로그 확인
```bash
# React Native 로그
npx react-native log-android  # Android
npx react-native log-ios      # iOS
```

### 5. Docker 컨테이너 테스트

```bash
# 컨테이너 상태 확인
docker-compose ps

# 컨테이너 로그 확인
docker-compose logs -f api

# 컨테이너 내부 접속
docker-compose exec api bash

# 컨테이너 내에서 Python 테스트
python -c "from models import get_fruit_model; print('Model loaded:', get_fruit_model())"
```

## 📱 사용 방법

### 1. 홈 화면
- 앱 기능 소개 확인
- 서버 상태 확인
- "촬영 시작" 버튼 클릭

### 2. 카메라 화면
- 음식이나 음료를 화면 중앙에 배치
- 음료의 경우 라벨이 정면으로 보이도록 촬영
- 촬영 버튼 클릭
- AI가 자동으로 분석 시작

### 3. 결과 화면
- **감지된 음식**: 음식 종류와 신뢰도 표시
- **당뇨 위험도**: 색상 코드로 위험도 표시
  - 🔴 빨강: 높은 위험 (바나나, 수박)
  - 🟡 노랑: 주의 필요 (음료)
  - 🟢 녹색: 안전
- **칼로리 정보**: 예상 중량 및 칼로리
- **OCR 결과**: 인식된 텍스트 (음료만)
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

**응답 필드 설명:**
- `detected` (boolean): 음식 감지 여부
- `food_type` (string): 음식 종류 ("Banana", "Watermelon", "Drink")
- `food_class` (int): 음식 클래스 ID (0: 바나나, 1: 수박, 2: 음료)
- `confidence` (float): 감지 신뢰도 (0.0 ~ 1.0)
- `risk_message` (string): 당뇨 위험도 메시지
- `ocr_texts` (array): OCR로 추출한 텍스트 목록
- `nutrition_analysis` (string): 영양 성분 분석 (음료만)
- `calorie_info` (object): 칼로리 정보
  - `grams`: 예상 중량 (g)
  - `kcal`: 예상 칼로리 (kcal)
  - `scale_detected`: ArUco 마커 감지 여부

### GET `/health`

서버 상태를 확인합니다.

**응답**
```json
{
  "status": "healthy"
}
```

### GET `/`

API 정보를 확인합니다.

**응답**
```json
{
  "status": "ok",
  "message": "Diabetes Care Food Detection API is running",
  "version": "1.0.0"
}
```

## 🔧 트러블슈팅

### 백엔드 문제

#### 1. "ModuleNotFoundError: No module named 'xxx'"
```bash
# 해결: 의존성 재설치
pip install -r backend/requirements.txt

# Docker 사용 시
docker-compose down
docker-compose up --build
```

#### 2. "FileNotFoundError: best.pt not found"
```bash
# 해결: best.pt 파일을 프로젝트 루트에 배치
ls best.pt  # 파일 존재 확인

# Docker 볼륨 마운트 확인
docker-compose exec api ls /app/best.pt
```

#### 3. Docker 빌드 오류: "libgl1-mesa-glx has no installation candidate"
```bash
# 해결: 이미 수정됨 (Dockerfile에서 libgl1 사용)
# 최신 코드를 pull 받으세요
git pull origin main
```

#### 4. PaddleOCR 다운로드 느림
```bash
# 해결: 캐시 디렉토리 사용 (Docker Compose에 이미 설정됨)
# 로컬 실행 시 환경 변수 설정
export PADDLE_HOME=~/.paddle_cache
```

#### 5. "Address already in use: 8000"
```bash
# 해결: 포트 변경 또는 기존 프로세스 종료
# 포트 사용 중인 프로세스 찾기
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# 프로세스 종료 후 재시작
```

### 프론트엔드 문제

#### 1. "Unable to connect to server"
```javascript
// 해결 1: API URL 확인
// src/services/api.js

// Android 에뮬레이터
const API_BASE_URL = 'http://10.0.2.2:8000';

// 실제 기기 (로컬 IP 확인 필요)
const API_BASE_URL = 'http://192.168.0.10:8000';
```

```bash
# 해결 2: 방화벽 확인
# Windows 방화벽에서 8000 포트 허용

# 해결 3: 백엔드 서버 실행 확인
curl http://localhost:8000/health
```

#### 2. "Android project not found"
```bash
# 해결: SETUP.md 가이드 참고
cd mobile-app
# React Native CLI로 프로젝트 초기화
npx react-native init TempApp
# android/ 폴더를 복사
```

#### 3. 카메라가 실행되지 않음

**증상:**
- 앱을 실행했지만 카메라 화면이 검은색으로 표시됨
- "카메라 권한이 필요합니다" 메시지가 계속 표시됨
- 앱이 카메라 권한을 요청하지 않음

**해결 방법:**

**1단계: Android 폴더가 존재하는지 확인**
```bash
cd mobile-app
ls -la android/
```

만약 `android/` 폴더가 없다면, 이미 생성되어 있어야 합니다. 이 프로젝트에는 Android 설정이 포함되어 있습니다.

**2단계: 의존성 설치 및 네이티브 모듈 링크**
```bash
cd mobile-app
npm install

# Android 폴더로 이동
cd android

# Gradle 캐시 클리어 및 클린 빌드
./gradlew clean

# 프로젝트 루트로 돌아가기
cd ../..
```

**3단계: AndroidManifest.xml 권한 확인**

`mobile-app/android/app/src/main/AndroidManifest.xml` 파일에 다음 권한이 있는지 확인:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>

<uses-feature android:name="android.hardware.camera" android:required="true" />
<uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
```

**4단계: 앱 완전히 재빌드**
```bash
cd mobile-app

# Android 앱 완전 재빌드
cd android && ./gradlew clean && cd ..

# Metro 캐시 클리어하고 시작
npm start -- --reset-cache

# 새 터미널에서 앱 실행
npm run android
```

**5단계: 기기에서 권한 수동 확인**

앱 설치 후에도 카메라가 작동하지 않으면:

1. 기기 **설정** → **앱** → **당뇨 케어** 선택
2. **권한** 메뉴 선택
3. **카메라** 권한이 **허용**으로 설정되어 있는지 확인
4. 권한이 거부되어 있다면 **허용**으로 변경
5. 앱을 완전히 종료하고 다시 시작

**6단계: 앱 재설치 (최후의 수단)**
```bash
# 앱 완전히 삭제
adb uninstall com.diabetescareapp

# 재설치
cd mobile-app
npm run android
```

**디버그 로그 확인:**
```bash
# Android 로그 실시간 확인
adb logcat | grep -i camera

# 또는
npx react-native log-android
```

에러 로그에서 다음과 같은 메시지를 찾아보세요:
- `Camera permission denied`
- `No camera device found`
- `Camera is not available`

**iOS의 경우:**

Info.plist 파일에 다음 추가:
```xml
<key>NSCameraUsageDescription</key>
<string>음식을 촬영하여 분석하기 위해 카메라 권한이 필요합니다.</string>
```

#### 4. Metro bundler 오류
```bash
# 해결: 캐시 클리어
npm start -- --reset-cache

# 또는
npx react-native start --reset-cache
```

#### 5. "Unable to resolve module"
```bash
# 해결: node_modules 재설치
rm -rf node_modules
npm install

# iOS의 경우 pod 재설치
cd ios && pod install && cd ..
```

### 일반적인 문제

#### 1. 버전 충돌
```bash
# 해결: 정확한 버전 사용
# Python
python --version  # 3.10.13 권장

# Node.js
node --version  # 18.18.0 권장
nvm use 18.18.0  # nvm 사용 시

# 또는 .nvmrc, .python-version 파일 참고
```

#### 2. 네트워크 타임아웃
```javascript
// 해결: api.js 타임아웃 증가
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,  // 30000 → 60000으로 증가
  headers: {'Content-Type': 'multipart/form-data'},
});
```

#### 3. Docker 디스크 공간 부족
```bash
# 해결: Docker 정리
docker system prune -a
docker volume prune
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

### Lazy Loading 패턴

모델은 **처음 사용될 때만 로딩**되어 다음 장점이 있습니다:
- 앱 시작 속도 향상
- 모델 파일이 없어도 앱 크래시 방지
- 메모리 효율적 사용

```python
# models.py
def get_fruit_model():
    global _fruit_model
    if _fruit_model is None:
        print(f"[INFO] Loading YOLO fruit model: {FRUIT_MODEL_PATH}")
        _fruit_model = YOLO(FRUIT_MODEL_PATH)
    return _fruit_model
```

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

## 📚 추가 문서

- **SETUP.md**: React Native 프로젝트 초기 설정 가이드
- **VERSIONS.md**: 의존성 버전 및 호환성 매트릭스
- **API Docs**: http://localhost:8000/docs (서버 실행 후)

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
