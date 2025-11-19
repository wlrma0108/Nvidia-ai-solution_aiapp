"""웹앱 기본 기능 테스트"""
import sys

print("=" * 60)
print("웹앱 의존성 테스트")
print("=" * 60)

# 1. Flask 테스트
try:
    import flask
    print("✓ Flask 설치됨:", flask.__version__)
except ImportError as e:
    print("✗ Flask 없음:", e)
    sys.exit(1)

# 2. Pillow 테스트
try:
    from PIL import Image
    print("✓ Pillow 설치됨")
except ImportError as e:
    print("✗ Pillow 없음:", e)
    sys.exit(1)

# 3. OpenCV 테스트
try:
    import cv2
    print("✓ OpenCV 설치됨:", cv2.__version__)
except ImportError as e:
    print("✗ OpenCV 없음:", e)
    sys.exit(1)

# 4. NumPy 테스트
try:
    import numpy as np
    print("✓ NumPy 설치됨:", np.__version__)
except ImportError as e:
    print("✗ NumPy 없음:", e)
    sys.exit(1)

# 5. Config 테스트
try:
    from config import FOOD_NAMES, FRUIT_MODEL_PATH
    print("✓ Config 로드됨")
    print(f"  - FRUIT_MODEL_PATH: {FRUIT_MODEL_PATH}")

    import os
    if os.path.exists(FRUIT_MODEL_PATH):
        print(f"  - best.pt 파일 존재: ✓")
    else:
        print(f"  - best.pt 파일 없음: ✗")
except Exception as e:
    print("✗ Config 로드 실패:", e)
    sys.exit(1)

# 6. 모델 로딩 테스트 (시간이 걸릴 수 있음)
print("\n모델 로딩 테스트 (시간이 걸릴 수 있습니다)...")
try:
    print("  - YOLO 모델 로딩 중...")
    from models import fruit_model, coco_model
    print("  ✓ YOLO 모델 로딩 완료")

    print("  - PaddleOCR 로딩 중...")
    from models import ocr
    print("  ✓ PaddleOCR 로딩 완료")
except Exception as e:
    print("  ✗ 모델 로딩 실패:", e)
    import traceback
    traceback.print_exc()
    sys.exit(1)

# 7. Flask 앱 로딩 테스트
try:
    from app import app
    print("✓ Flask 앱 로딩 완료")
except Exception as e:
    print("✗ Flask 앱 로딩 실패:", e)
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "=" * 60)
print("✓ 모든 테스트 통과!")
print("=" * 60)
print("\n웹앱을 시작하려면 다음 명령을 실행하세요:")
print("  python app.py")
print("\n그 다음 브라우저에서 http://localhost:5000 을 열어주세요")
