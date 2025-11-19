# Diacare - 당뇨 환자용 음식/약 섭취 관리 서비스

## 📋 전체 시스템 아키텍처

### 기술 스택
- **프론트엔드**: React 18 + TypeScript + Vite + React Router v6
- **백엔드**: Python FastAPI + SQLAlchemy + JWT
- **DB**: SQLite (개발) / PostgreSQL (프로덕션)
- **AI 모델**: YOLO (best.pt) + PaddleOCR
- **인증**: JWT (Access Token + Refresh Token)

---

## 🗄️ 데이터베이스 스키마

### ERD

```
users (사용자)
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

intake_logs (섭취 기록)
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

### SQL 스키마

```sql
-- users 테이블
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    birth_year INTEGER,
    gender VARCHAR(10),
    uses_insulin BOOLEAN DEFAULT FALSE,
    daily_sugar_target_g FLOAT DEFAULT 50.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- intake_logs 테이블
CREATE TABLE intake_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    log_type VARCHAR(20) NOT NULL CHECK(log_type IN ('food', 'drug')),
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    detection_result TEXT, -- JSON 문자열
    risk_level VARCHAR(20) CHECK(risk_level IN ('GOOD', 'WARNING', 'BAD')),
    estimated_sugar_g FLOAT DEFAULT 0.0,
    risk_score INTEGER DEFAULT 0 CHECK(risk_score >= 0 AND risk_score <= 100),
    summary TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_intake_logs_user_id ON intake_logs(user_id);
CREATE INDEX idx_intake_logs_logged_at ON intake_logs(logged_at);
```

---

## 🔙 백엔드 구조

### 디렉토리 구조

```
backend/
├── app.py                      # FastAPI 메인 앱
├── database.py                 # DB 연결 및 세션
├── models.py                   # SQLAlchemy 모델
├── schemas.py                  # Pydantic 스키마
├── auth.py                     # JWT 인증 유틸리티
├── dependencies.py             # FastAPI 의존성 (인증 체크 등)
├── init_db.py                  # DB 초기화 스크립트
├── routers/
│   ├── __init__.py
│   ├── auth.py                 # POST /auth/register, /auth/login, /auth/me
│   ├── food.py                 # POST /api/food/detect
│   ├── drug.py                 # POST /api/drug/detect
│   └── user.py                 # GET /api/user/logs, GET /api/user/stats
├── services/
│   ├── __init__.py
│   ├── detection_service.py    # YOLO + OCR 래퍼
│   └── risk_service.py         # 위험도 평가 로직
└── requirements.txt
```

### 주요 API 엔드포인트

#### 인증
- `POST /auth/register` - 회원가입
- `POST /auth/login` - 로그인 (JWT 발급)
- `GET /auth/me` - 현재 사용자 정보 조회

#### 음식/약 분석
- `POST /api/food/detect` - 실시간 음식 감지 (live frame)
- `POST /api/drug/detect` - 약 사진 분석

#### 사용자 데이터
- `GET /api/user/logs?date=2025-01-19&type=food` - 섭취 기록 조회
- `GET /api/user/stats?period=7` - 통계 조회 (목표 달성 여부 등)
- `POST /api/user/logs` - 수동 기록 추가

---

## 🎨 프론트엔드 구조

### 디렉토리 구조

```
web-app/
├── src/
│   ├── types/
│   │   └── index.ts            # TypeScript 타입 정의
│   ├── services/
│   │   └── api.ts              # API 클라이언트
│   ├── contexts/
│   │   └── AuthContext.tsx     # 인증 Context
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── FoodDetector.tsx    # 실시간 카메라
│   │   ├── DrugDetector.tsx
│   │   └── IntakeLogCard.tsx
│   ├── pages/
│   │   ├── LandingPage.tsx     # 홈페이지
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx   # 음식/약 분석
│   │   └── MyPage.tsx          # 마이페이지
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── tsconfig.json
└── package.json
```

### 라우팅 구조

```
/ → LandingPage (공개)
/login → LoginPage (공개)
/register → RegisterPage (공개)
/dashboard → DashboardPage (인증 필요)
/mypage → MyPage (인증 필요)
```

---

## 🧪 주요 기능 명세

### 1. 음식 분석 - 실시간 물체 인식

**프론트엔드 흐름:**
1. `/dashboard` 페이지의 "음식/음료 분석" 탭
2. `getUserMedia()`로 카메라 스트림 획득
3. "실시간 분석 시작" 버튼 클릭
4. 1초마다 `<canvas>`에서 프레임 캡처 → Blob 생성
5. `POST /api/food/detect`로 전송
6. 응답 받아서:
   - 바운딩 박스 오버레이 (Canvas API)
   - 인식 결과 텍스트 표시
   - 위험도 메시지 표시

**백엔드 로직:**
```python
# services/detection_service.py

def detect_food(frame: np.ndarray) -> dict:
    # 1. YOLO로 객체 감지
    results = yolo_model.predict(frame)

    boxes = []
    for det in results:
        label = det.label  # 'banana', 'watermelon', 'bottle', 'cup' 등
        bbox = det.bbox
        score = det.score

        # 2. 음료 계열이면 OCR 실행
        text = None
        if label in ['bottle', 'cup', 'coffee']:
            cropped = crop_image(frame, bbox)
            ocr_result = run_ocr(cropped)
            text = extract_nutrition_text(ocr_result)  # "당류 18g" 추출

        boxes.append({
            "x1": bbox[0], "y1": bbox[1],
            "x2": bbox[2], "y2": bbox[3],
            "label": label,
            "score": score,
            "text": text
        })

    # 3. 위험도 평가
    risk_message = evaluate_food_risk(boxes)

    return {
        "mode": "food",
        "boxes": boxes,
        "risk_message": risk_message
    }
```

### 2. 약 분석 - 사진 기반 OCR

**프론트엔드:**
- 카메라 캡처 또는 파일 업로드
- `POST /api/drug/detect`로 전송

**백엔드 로직:**
```python
def detect_drug(frame: np.ndarray) -> dict:
    # 1. 약 패키지 검출 (YOLO 또는 전체 이미지 OCR)
    ocr_result = run_ocr(frame)

    # 2. 약 이름, 성분, 용량 추출
    drug_info = extract_drug_info(ocr_result)

    # 3. 위험도 평가 (당뇨 환자 관점)
    risk_message = evaluate_drug_risk(drug_info)

    return {
        "mode": "drug",
        "boxes": [...],
        "drug_info": drug_info,
        "risk_message": risk_message
    }
```

### 3. 위험도 평가 로직

```python
# services/risk_service.py

def evaluate_food_risk(boxes: list) -> str:
    messages = []

    for box in boxes:
        label = box['label']
        text = box.get('text')

        if label == 'banana':
            messages.append(
                "바나나는 당지수가 높아 혈당을 빠르게 올립니다. "
                "반 개 이하로 제한하세요."
            )
        elif label == 'watermelon':
            messages.append(
                "수박은 수분이 많지만 당지수가 높습니다. "
                "한 컵 이하로 제한하세요."
            )
        elif label in ['bottle', 'cup'] and text:
            sugar_g = extract_sugar_amount(text)
            if sugar_g > 15:
                messages.append(
                    f"이 음료는 당류 {sugar_g}g이 포함되어 있어 "
                    f"당뇨 환자에게 과도합니다. 섭취를 피하세요."
                )
            elif sugar_g > 5:
                messages.append(
                    f"이 음료는 당류 {sugar_g}g이 포함되어 있습니다. "
                    f"소량만 섭취하세요."
                )

    return " ".join(messages) if messages else "감지된 항목이 없습니다."

def calculate_risk_score(estimated_sugar_g: float, target_g: float) -> int:
    # 0-100 점수로 환산
    ratio = estimated_sugar_g / target_g
    if ratio <= 0.5:
        return 0  # GOOD
    elif ratio <= 1.0:
        return 50  # WARNING
    else:
        return 100  # BAD
```

### 4. 마이페이지 - "돈" 컨셉

**목표 달성 판정:**
```python
def evaluate_daily_goal(user_id: int, date: str) -> dict:
    user = get_user(user_id)
    logs = get_logs_by_date(user_id, date)

    total_sugar = sum(log.estimated_sugar_g for log in logs)
    target = user.daily_sugar_target_g

    achieved = total_sugar <= target

    # 가상의 금액 계산
    if achieved:
        saved_cost = 10000  # 기본 예방비
        message = (
            f"오늘은 당뇨 관리 목표를 지켰습니다! 🎉\n"
            f"예상적으로 {saved_cost:,}원의 치료비/합병증 위험 비용을 아꼈습니다."
        )
    else:
        excess = total_sugar - target
        extra_cost = int(excess * 1000)  # 1g당 1000원으로 가정
        message = (
            f"오늘은 당 섭취 관리가 부족했습니다. ⚠️\n"
            f"목표보다 {excess:.1f}g 초과했습니다.\n"
            f"장기적으로 {extra_cost:,}원의 추가 치료비/예방비가 들 수 있습니다."
        )

    return {
        "achieved": achieved,
        "total_sugar_g": total_sugar,
        "target_g": target,
        "message": message,
        "cost_impact": saved_cost if achieved else -extra_cost
    }
```

---

## 🔐 인증 시스템

### JWT 구조

```python
# auth.py

from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

SECRET_KEY = "your-secret-key-here"  # 환경 변수로 관리
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
```

### 인증 의존성

```python
# dependencies.py

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return user
```

---

## 📱 프론트엔드 TypeScript 타입

```typescript
// types/index.ts

export interface User {
  id: number;
  email: string;
  name: string;
  birthYear?: number;
  gender?: string;
  usesInsulin: boolean;
  dailySugarTargetG: number;
  createdAt: string;
}

export interface DetectionBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  score: number;
  text?: string;
}

export interface DetectionResult {
  mode: 'food' | 'drug';
  boxes: DetectionBox[];
  riskMessage: string;
  drugInfo?: {
    name?: string;
    ingredients?: string[];
    dosage?: string;
  };
}

export interface IntakeLog {
  id: number;
  userId: number;
  logType: 'food' | 'drug';
  loggedAt: string;
  detectionResult: DetectionResult;
  riskLevel: 'GOOD' | 'WARNING' | 'BAD';
  estimatedSugarG: number;
  riskScore: number;
  summary: string;
}

export interface DailyStats {
  achieved: boolean;
  totalSugarG: number;
  targetG: number;
  message: string;
  costImpact: number;
}
```

---

## 🚀 구현 순서

1. **DB 설정** (1h)
   - `backend/database.py`, `models.py` 작성
   - `init_db.py`로 테이블 생성

2. **인증 시스템** (2h)
   - `auth.py`, `dependencies.py` 작성
   - `routers/auth.py` 구현

3. **백엔드 API** (3h)
   - `routers/food.py`, `drug.py` 구현
   - `services/detection_service.py`, `risk_service.py` 작성

4. **프론트엔드 TypeScript 마이그레이션** (2h)
   - `tsconfig.json` 설정
   - 기존 `.jsx` → `.tsx` 변환

5. **인증 페이지** (2h)
   - `LoginPage.tsx`, `RegisterPage.tsx`
   - `AuthContext.tsx`

6. **랜딩 페이지** (1h)
   - `LandingPage.tsx`

7. **대시보드** (3h)
   - `DashboardPage.tsx`
   - `FoodDetector.tsx`, `DrugDetector.tsx`

8. **마이페이지** (2h)
   - `MyPage.tsx`
   - 통계 차트 구현

**총 예상 시간: 16시간**

---

## 📚 참고 자료

- FastAPI 공식 문서: https://fastapi.tiangolo.com/
- React Router v6: https://reactrouter.com/
- TypeScript 핸드북: https://www.typescriptlang.org/docs/
- SQLAlchemy ORM: https://docs.sqlalchemy.org/

---

이 설계 문서를 기반으로 단계별로 구현하시면 됩니다.
각 단계별 상세 코드는 별도 파일로 제공됩니다.
