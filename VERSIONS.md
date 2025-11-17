# 버전 정보 및 호환성

이 프로젝트는 특정 버전으로 고정되어 안정성을 보장합니다.

## 런타임 환경

### Python
- **버전**: 3.10.13
- **설치**: `pyenv install 3.10.13`
- **확인**: `.python-version` 파일 참조

### Node.js
- **버전**: 18.18.0 LTS
- **설치**: `nvm install 18.18.0`
- **확인**: `.nvmrc` 파일 참조

## 백엔드 의존성

### 핵심 프레임워크
- **FastAPI**: 0.104.1
- **Uvicorn**: 0.24.0
- **Python**: 3.10.13

### AI/ML 라이브러리
- **PyTorch**: 2.0.1
- **Torchvision**: 0.15.2
- **NumPy**: 1.24.3
- **Ultralytics (YOLO)**: 8.2.0
- **OpenCV**: 4.8.0.76

### OCR
- **PaddleOCR**: 2.7.0.3
- **PaddlePaddle**: 2.6.1

### 유틸리티
- **Pillow**: 10.1.0
- **Shapely**: 2.0.2
- **PyYAML**: 6.0.1
- **Requests**: 2.31.0

## 프론트엔드 의존성

### 핵심 프레임워크
- **React**: 18.2.0
- **React Native**: 0.72.6
- **Node.js**: 18.18.0

### 네비게이션
- **@react-navigation/native**: 6.1.9
- **@react-navigation/stack**: 6.3.20
- **react-native-screens**: 3.27.0
- **react-native-safe-area-context**: 4.7.4

### UI 라이브러리
- **react-native-linear-gradient**: 2.8.3
- **react-native-vector-icons**: 10.0.2
- **react-native-gesture-handler**: 2.14.0
- **react-native-reanimated**: 3.6.0

### 카메라 & API
- **react-native-vision-camera**: 3.6.6
- **Axios**: 1.6.2

### 개발 도구
- **@babel/core**: 7.23.3
- **ESLint**: 8.54.0
- **Jest**: 29.7.0
- **Prettier**: 3.1.0

## Docker

### 베이스 이미지
- **Python**: 3.10.13-slim-bookworm (Debian 12)

### 시스템 패키지 (Debian 12 Bookworm)
- **libgl1**: 1.6.0-1
- **libglib2.0-0**: 2.74.6-2+deb12u3
- **libsm6**: 2:1.2.3-1
- **libxext6**: 2:1.3.4-1+b1
- **libxrender1**: 1:0.9.10-1.1
- **libgomp1**: 12.2.0-14
- **libgthread-2.0-0**: 2.74.6-2+deb12u3

### Python 패키지 관리자
- **pip**: 23.3.1
- **setuptools**: 69.0.2
- **wheel**: 0.42.0

## 호환성 매트릭스

### Python 3.10.13 호환성
| 패키지 | 버전 | 상태 |
|--------|------|------|
| PyTorch | 2.0.1 | ✅ 검증됨 |
| NumPy | 1.24.3 | ✅ 검증됨 |
| OpenCV | 4.8.0.76 | ✅ 검증됨 |
| PaddleOCR | 2.7.0.3 | ✅ 검증됨 |

### React Native 0.72.6 호환성
| 패키지 | 버전 | 상태 |
|--------|------|------|
| React | 18.2.0 | ✅ 검증됨 |
| React Navigation | 6.1.9 | ✅ 검증됨 |
| Vision Camera | 3.6.6 | ✅ 검증됨 |

## 업그레이드 가이드

### Python 의존성 업그레이드
```bash
# 특정 패키지 업그레이드 전 테스트
pip install --upgrade <package>==<new_version>
pip freeze > backend/requirements.txt

# 전체 테스트 후 적용
pytest
```

### Node.js 의존성 업그레이드
```bash
# 특정 패키지 업그레이드
npm install <package>@<version> --save-exact

# 업그레이드 후 테스트
npm test
npm run android  # 또는 ios
```

## 알려진 이슈

### 버전 충돌
1. **NumPy > 1.24.x + PaddlePaddle**: 호환성 문제 발생 가능
2. **PyTorch 2.1.x + Python 3.10**: 일부 환경에서 CUDA 오류
3. **React Native 0.73.x**: 아직 vision-camera와 호환성 미검증

## 보안 업데이트

정기적으로 보안 패치를 확인하세요:
```bash
# Python
pip list --outdated
safety check

# Node.js
npm audit
npm audit fix
```

## 문의

버전 관련 문제가 있으면 GitHub Issues를 통해 제보해주세요.
