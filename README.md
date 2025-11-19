# Diacare - 당뇨병 환자용 AI 기반 음식/약 섭취 관리 서비스

당뇨병 환자를 위한 스마트 건강 관리 플랫폼입니다. AI 기반 음식/약물 분석, 실시간 위험도 평가, 섭취 기록 관리, 그리고 의료비 절감 효과 시각화를 제공합니다.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.3-blue.svg)
![React](https://img.shields.io/badge/react-18.2-blue.svg)
![FastAPI](https://img.shields.io/badge/fastapi-latest-green.svg)

## 📋 목차

- [주요 기능](#주요-기능)
- [시스템 아키텍처](#시스템-아키텍처)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [설치 및 실행](#설치-및-실행)
- [API 문서](#api-문서)
- [환경 변수 설정](#환경-변수-설정)
- [사용 방법](#사용-방법)
- [트러블슈팅](#트러블슈팅)

## 🎯 주요 기능

### 1. 실시간 음식 분석
- **YOLO 기반 객체 감지**: 과일(바나나, 수박) 및 음료 용기(병, 컵) 자동 인식
- **PaddleOCR 텍스트 인식**: 영양 성분표 자동 읽기
- **실시간 Live Detection**: 카메라로 음식을 비추면 즉시 인식
- **당 함량 추정**: 음식별 예상 당 섭취량 계산

### 2. 약물 분석
- **약 패키지 OCR**: 약 이름, 성분, 용량 자동 추출
- **당뇨 환자 맞춤 위험도 평가**: 혈당에 영향을 주는 약물 감지
- **인슐린 투여 여부 고려**: 사용자 프로필 기반 개인화된 경고

### 3. 섭취 기록 관리
- **자동 기록 저장**: 분석한 음식/약물 자동 저장
- **일별/주별/월별 통계**: 당 섭취량 추이 확인
- **목표 달성 여부 추적**: 일일 당 섭취 목표 설정 및 모니터링

### 4. 비용 절감 효과 시각화
- **의료비 절감 계산**: 당뇨 관리를 통한 예상 절감액 표시
- **금전적 동기 부여**: 건강 관리를 금전적 이득으로 환산
- **장기 추세 분석**: 누적 절감액 및 관리 효과 시각화

## 🏗️ 시스템 아키텍처

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  React Web App  │────────▶│   FastAPI       │────────▶│   SQLite DB     │
│  (TypeScript)   │  HTTP   │   Backend       │  ORM    │   (or Postgres) │
│                 │◀────────│   (Python)      │◀────────│                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
        │                            │
        │                            │
        │                            ▼
        │                   ┌─────────────────┐
        │                   │   AI Models     │
        │                   │  - YOLO (best.pt)│
        │                   │  - PaddleOCR    │
        │                   └─────────────────┘
        │
        ▼
┌─────────────────┐
│  JWT Auth       │
│  LocalStorage   │
└─────────────────┘
```

## 🛠️ 기술 스택

### Backend
- **Framework**: FastAPI
- **Database**: SQLAlchemy (SQLite/PostgreSQL)
- **Authentication**: JWT (python-jose, passlib)
- **AI Models**:
  - YOLO (best.pt) - 음식 객체 감지
  - PaddleOCR - 한글 텍스트 인식
  - OpenCV - 이미지 처리

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context API

### Database Schema
```sql
users
├── id (PK)
├── email (UNIQUE)
├── password_hash
├── name
├── birth_year
├── gender
├── uses_insulin
├── daily_sugar_target_g
├── created_at
└── updated_at

intake_logs
├── id (PK)
├── user_id (FK → users.id)
├── log_type ('food' | 'drug')
├── logged_at
├── detection_result (JSON)
├── risk_level ('GOOD' | 'WARNING' | 'BAD')
├── estimated_sugar_g
├── risk_score (0-100)
└── summary
```

## 📁 프로젝트 구조

```
.
├── backend/
│   ├── app.py                    # FastAPI 메인 앱
│   ├── database.py               # DB 연결 및 세션
│   ├── models.py                 # SQLAlchemy 모델
│   ├── schemas.py                # Pydantic 스키마
│   ├── auth.py                   # JWT 인증 유틸
│   ├── dependencies.py           # FastAPI 의존성
│   ├── init_db.py                # DB 초기화
│   ├── routers/
│   │   ├── auth.py               # 인증 API
│   │   ├── food.py               # 음식 분석 API
│   │   ├── drug.py               # 약물 분석 API
│   │   └── user.py               # 사용자 데이터 API
│   ├── services/
│   │   ├── detection_service.py  # YOLO + OCR 서비스
│   │   └── risk_service.py       # 위험도 평가 로직
│   ├── requirements.txt
│   └── .env.example
│
├── web-app/
│   ├── src/
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript 타입
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx   # 인증 Context
│   │   ├── services/
│   │   │   └── api.ts            # API 클라이언트
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx   # 홈페이지
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx # 분석 페이지
│   │   │   └── MyPage.tsx        # 마이페이지
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── package.json
│
├── SYSTEM_DESIGN.md              # 상세 설계 문서
├── config.py                     # AI 모델 설정
├── detection.py                  # YOLO 감지 로직
├── ocr_utils.py                  # OCR 유틸리티
├── best.pt                       # YOLO 모델 파일
└── README.md
```

## 🚀 설치 및 실행

### 1. 사전 요구사항

- Python 3.10+
- Node.js 18+
- npm or yarn
- CUDA (선택사항, GPU 가속용)

### 2. Backend 설정

```bash
# 1. Python 가상환경 생성
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# 2. 의존성 설치
pip install -r requirements.txt

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일을 열어서 SECRET_KEY 등을 설정

# 4. 데이터베이스 초기화
python init_db.py

# 5. 서버 실행
cd ..
python -m uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000
```

서버가 실행되면 http://localhost:8000 에서 API에 접근할 수 있습니다.

### 3. Frontend 설정

```bash
# 1. 의존성 설치
cd web-app
npm install

# 또는 TypeScript 추가 설치가 필요한 경우
npm install typescript --save-dev

# 2. 환경 변수 설정 (선택사항)
# .env 파일 생성
echo "VITE_API_URL=http://localhost:8000" > .env

# 3. 개발 서버 실행
npm run dev
```

브라우저가 자동으로 열리며 http://localhost:3000 에서 앱에 접근할 수 있습니다.

### 4. 프로덕션 빌드

```bash
# Frontend 빌드
cd web-app
npm run build
# dist/ 폴더에 빌드 결과 생성

# Backend 프로덕션 실행
cd ..
uvicorn backend.app:app --host 0.0.0.0 --port 8000
```

## 📚 API 문서

### 인증 (Authentication)

#### POST /auth/register
회원가입

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동",
  "birthYear": 1990,
  "gender": "male",
  "usesInsulin": false,
  "dailySugarTargetG": 50.0
}
```

#### POST /auth/login
로그인

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer"
}
```

#### GET /auth/me
현재 사용자 정보 조회
- Header: `Authorization: Bearer <token>`

### 음식/약 분석

#### POST /api/food/detect
음식 분석 (인증 필요)

**Request:**
- Content-Type: multipart/form-data
- Header: `Authorization: Bearer <token>`
- Body: `file` (image file)

**Response:**
```json
{
  "detected": true,
  "logId": 1,
  "foodType": "바나나",
  "riskLevel": "WARNING",
  "riskMessage": "바나나는 당지수가 높아...",
  "estimatedSugarG": 12.0,
  "ocrTexts": ["당류 18g", "..."]
}
```

#### POST /api/drug/detect
약물 분석 (인증 필요)

**Request:**
- Content-Type: multipart/form-data
- Header: `Authorization: Bearer <token>`
- Body: `file` (image file)

**Response:**
```json
{
  "detected": true,
  "logId": 2,
  "drugInfo": {
    "name": "타이레놀",
    "ingredients": ["아세트아미노펜"],
    "dosage": "500mg"
  },
  "riskLevel": "GOOD",
  "riskMessage": "일반적으로 안전..."
}
```

### 사용자 데이터

#### GET /api/user/logs?date=2025-01-19&log_type=food
섭취 기록 조회 (인증 필요)

**Query Parameters:**
- `date` (optional): YYYY-MM-DD
- `log_type` (optional): food | drug

#### GET /api/user/stats?period=7
통계 조회 (인증 필요)

**Query Parameters:**
- `period` (optional): 1-30 (days)

**Response:**
```json
{
  "achieved": true,
  "totalSugarG": 280.5,
  "targetG": 350.0,
  "message": "최근 7일 동안 목표를 달성했습니다...",
  "costImpact": 70000,
  "logCount": 15
}
```

### Legacy API (인증 불필요)

#### POST /analyze
음식 분석 (기존 웹앱 호환용)

#### POST /detect-live
실시간 감지 (기존 웹앱 호환용)

## ⚙️ 환경 변수 설정

### Backend (.env)
```env
DATABASE_URL=sqlite:///./diacare.db
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=10080
FRUIT_MODEL_PATH=./best.pt
USE_CALORIE=true
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## 💡 사용 방법

### 1. 회원가입 및 로그인
1. 웹 앱 접속 (http://localhost:3000)
2. "무료로 시작하기" 클릭
3. 이메일, 비밀번호, 이름 등 입력
4. 일일 당 섭취 목표 설정 (기본: 50g)
5. 회원가입 완료 후 자동 로그인

### 2. 음식 분석
1. 대시보드 → "음식/음료 분석" 탭
2. 파일 선택 또는 카메라로 촬영
3. "분석하기" 버튼 클릭
4. AI가 음식을 인식하고 위험도 평가
5. 자동으로 섭취 기록에 저장

### 3. 약물 분석
1. 대시보드 → "약물 분석" 탭
2. 약 패키지 사진 업로드
3. OCR로 약 정보 추출
4. 당뇨 환자 관점에서 위험도 평가

### 4. 마이페이지
1. 마이페이지 접속
2. 최근 7일/30일 통계 확인
3. 목표 달성 여부 및 비용 절감 효과 확인
4. 섭취 기록 목록 조회 (필터링 가능)

## 🐛 트러블슈팅

### 1. Backend 오류

**Q: ModuleNotFoundError: No module named 'jose'**
```bash
pip install python-jose[cryptography]
```

**Q: Database initialization failed**
```bash
# DB 파일 삭제 후 재생성
rm backend/diacare.db
python backend/init_db.py
```

**Q: YOLO 모델 로드 실패**
```bash
# best.pt 파일이 프로젝트 루트에 있는지 확인
ls best.pt

# config.py에서 경로 확인
```

### 2. Frontend 오류

**Q: TypeScript 컴파일 오류**
```bash
# TypeScript 재설치
npm install typescript --save-dev

# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

**Q: API 요청 실패 (CORS)**
- Backend CORS 설정 확인
- frontend .env에서 VITE_API_URL 확인

**Q: 로그인 후 리다이렉트 안됨**
- LocalStorage에 token이 저장되었는지 확인
- 개발자 도구 → Application → Local Storage

### 3. AI 모델 오류

**Q: OCR이 작동하지 않음**
```bash
# PaddleOCR 재설치
pip uninstall paddleocr
pip install paddleocr
```

**Q: YOLO 감지 성능이 낮음**
- 이미지 해상도 확인 (최소 640x640 권장)
- 조명 조건 개선
- best.pt 모델 업데이트

## 📖 추가 문서

- [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) - 상세 시스템 설계 문서
- [Backend API 상세](./backend/README.md)
- [Frontend 구조](./web-app/README.md)

## 👥 기여

프로젝트에 기여하고 싶으시다면 Pull Request를 보내주세요!

## 📄 라이선스

MIT License

---

**Diacare** - 당뇨병 환자를 위한 스마트 건강 관리 플랫폼
