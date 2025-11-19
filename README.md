# Nvidia AI Solution - 당뇨 관리 음식/음료 감지 시스템

NVIDIA AI 기술을 활용한 실시간 음식 및 음료 감지, OCR 기반 영양 분석, 칼로리 추정 시스템입니다. 당뇨 환자의 식단 관리를 돕기 위해 개발되었습니다.

## 주요 기능

### 1. 실시간 음식/음료 감지
- **YOLO 기반 객체 감지**: 바나나, 수박, 음료(병/컵/잔) 인식
- **Kalman 필터 기반 객체 추적**: 안정적인 실시간 추적
- **당뇨 위험도 평가**: 각 음식별 혈당 영향 정보 제공

### 2. OCR 기반 영양 분석
- **PaddleOCR**: 포장지 및 라벨의 텍스트 인식
- **영양 성분 추출**: 당류, 탄수화물, 나트륨 등 자동 분석
- **약/처방전 OCR**: 단일 이미지에서 텍스트 추출

### 3. 칼로리 추정
- **ArUco 마커 기반 스케일 감지**: 실제 크기 측정
- **자동 칼로리 계산**: 객체 크기 기반 칼로리 추정
- **클래스별 맞춤 추정**: 음식별 밀도와 형태 고려

## 기술 스택

- **객체 감지**: YOLOv8 (Ultralytics)
- **OCR**: PaddleOCR 2.7.0.3
- **컴퓨터 비전**: OpenCV 4.8.0
- **딥러닝**: PyTorch, PaddlePaddle
- **객체 추적**: Kalman Filter

## 프로젝트 구조

```
Nvidia_project/
├─ config.py          # 환경변수 + 공통 상수/파라미터
├─ models.py          # YOLO, PaddleOCR 모델 로딩
├─ tracking.py        # Kalman + MultiObjectTracker
├─ calorie.py         # ArUco 스케일 + 칼로리 추정
├─ ocr_utils.py       # Food/Drink용 OCR 유틸 + 영양 분석
├─ detection.py       # 한 프레임 처리(detect_step)
├─ main.py            # 음식/음료 카메라 실시간 처리
├─ DrugDetection.py   # 약/처방전 이미지 OCR (단일 이미지)
├─ best.pt            # 학습된 YOLO 모델 가중치
└─ requirements.txt   # 의존성 패키지 목록
```

## 설치 방법

### 1. 필수 요구사항
- Python 3.8+
- CUDA 지원 GPU (권장)
- 웹캠 (실시간 감지용)

### 2. 패키지 설치
```bash
pip install -r requirements.txt
```

### 3. 모델 파일 준비
- `best.pt`: 사용자 정의 학습 모델 (바나나, 수박, 음료 감지)
- YOLOv8n 모델은 자동 다운로드됩니다

### 4. 환경 설정
`config.py` 파일에서 다음 항목을 수정하세요:
```python
# 모델 경로 설정
FRUIT_MODEL_PATH = "path/to/your/best.pt"

# PaddleOCR 캐시 경로 설정 (Windows)
PADDLE_HOME = r"C:\paddle_ocr_home"
```

## 사용 방법

### 실시간 음식/음료 감지
웹캠을 사용한 실시간 감지 및 분석:
```bash
python main.py
```

**기능:**
- 실시간 객체 감지 및 추적
- 안정화된 객체 자동 확정
- OCR 기반 포장지 텍스트 인식
- 영양 성분 자동 분석 (음료)
- ArUco 마커 기반 칼로리 추정
- 당뇨 위험도 메시지 표시

**조작법:**
- 감지 대상을 카메라에 비추세요
- 객체가 안정적으로 감지되면 자동 확정됩니다
- `q` 키를 눌러 종료

### 약/처방전 OCR
단일 이미지에서 텍스트 추출:
```bash
# 기본 이미지 사용
python DrugDetection.py

# 특정 이미지 지정
python DrugDetection.py path/to/image.jpg
```

## 감지 가능한 객체

| 클래스 | 설명 | 당뇨 위험도 메시지 |
|--------|------|-------------------|
| Banana (0) | 바나나 | 당지수가 높아서 혈당을 빠르게 올릴 수 있습니다 |
| Watermelon (1) | 수박 | 수분이 많지만 당지수가 높아 대량 섭취 시 혈당을 급격히 올릴 수 있습니다 |
| Drink (2) | 음료 (병/컵/잔) | 당 들어간 음료는 혈당을 급격히 올릴 수 있습니다. 라벨의 당류/탄수화물 양을 꼭 확인해야 합니다 |

## 주요 파라미터

### 감지 임계값
- **Fruit 모델**: confidence threshold 0.85
- **Drink 감지**: confidence threshold 0.45
- **IOU threshold**: 0.50

### 추적 및 안정화
- **MIN_HITS**: 최소 8프레임 연속 감지 필요
- **EMA_ON_THRES**: 0.80 (신뢰도 이동평균 임계값)
- **VERIFY_WINDOW**: 15프레임 검증 윈도우
- **COOLDOWN_FRAMES**: 20프레임 쿨다운

### 칼로리 추정 기준 (100g당)
- **바나나**: 89 kcal
- **수박**: 30 kcal
- **음료**: 45 kcal (기본값)

## 주요 모듈 설명

### config.py
전역 설정 및 파라미터 관리:
- 모델 경로 설정
- 클래스 정의 및 매핑
- 감지/추적 파라미터
- 칼로리 추정 설정

### models.py
AI 모델 초기화 및 관리:
- YOLO 모델 로딩 (fruit/drink)
- PaddleOCR 인스턴스 생성 (싱글톤)

### tracking.py
객체 추적 시스템:
- Kalman 필터 기반 예측
- Multi-object tracking
- IOU 기반 매칭

### detection.py
프레임 처리 로직:
- YOLO 추론 실행
- 필터링 (aspect ratio, 면적, confidence)
- 안정화 검증
- 추적 업데이트

### ocr_utils.py
OCR 및 영양 분석:
- crop 영역 텍스트 추출
- 영양 성분 파싱 (정규식)
- 음료 영양 분석 리포트

### calorie.py
칼로리 추정:
- ArUco 마커 감지 및 스케일 계산
- 객체 크기 기반 무게 추정
- 칼로리 계산

## 출력 예시

```
[CONFIRMED] Drink  ema=0.92
[RISK] 당 들어간 음료는 혈당을 급격히 올릴 수 있습니다. 라벨의 당류/탄수화물 양을 꼭 확인해야 합니다.
[OCR TEXT (상위 일부)]
 - 코카콜라
 - 영양성분
 - 당류 27g
 - 탄수화물 28g
 - 나트륨 15mg
[OCR 기반 음료 영양 분석]
 - 당류: 27.0 g
 - 탄수화물: 28.0 g
 - 나트륨: 15.0 mg
[INFO] 스케일 감지: 0.0234 cm/px
[CALORIE EST]
 - grams : 250.0 g
 - kcal  : 112.5 kcal
```

## 문제 해결

### OCR이 작동하지 않는 경우
- PaddleOCR 모델이 자동 다운로드되는지 확인
- `PADDLE_HOME` 경로가 올바른지 확인
- 인터넷 연결 상태 확인

### 모델을 찾을 수 없는 경우
- `config.py`의 `FRUIT_MODEL_PATH` 경로 확인
- `best.pt` 파일이 존재하는지 확인

### 칼로리 추정이 안 되는 경우
- ArUco 마커를 카메라에 비추세요
- 마커가 선명하게 보이도록 조명 조절
- `USE_CALORIE = True`로 설정되어 있는지 확인

## 라이선스

이 프로젝트는 NVIDIA AI 솔루션의 일부입니다.

## 기여

문제 또는 개선 사항이 있으면 이슈를 등록해주세요.

## 참고 자료

- [Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics)
- [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR)
- [OpenCV ArUco](https://docs.opencv.org/4.x/d5/dae/tutorial_aruco_detection.html)
