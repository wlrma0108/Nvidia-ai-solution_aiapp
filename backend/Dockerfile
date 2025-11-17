FROM python:3.10.13-slim-bookworm

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    libgthread-2.0-0 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

COPY backend/requirements.txt .

RUN pip install --upgrade pip==23.3.1 setuptools==69.0.2 wheel==0.42.0 && \
    pip install --no-cache-dir -r requirements.txt

COPY . /app/

RUN ls -la /app/best.pt || echo "Warning: best.pt not found"

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
