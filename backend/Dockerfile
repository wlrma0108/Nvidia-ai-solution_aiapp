FROM python:3.10-slim

WORKDIR /app

# 시스템 의존성 설치
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성 복사 및 설치
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 프로젝트 파일 복사
COPY . /app/

# best.pt 모델 파일이 있는지 확인
RUN ls -la /app/best.pt || echo "Warning: best.pt not found"

# 포트 노출
EXPOSE 8000

# FastAPI 서버 실행
CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000"]
