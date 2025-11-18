# 당뇨 케어 웹 애플리케이션

당뇨병 조기 진단 및 케어를 위한 AI 기반 **웹 애플리케이션**입니다. 웹 카메라로 음식을 촬영하면 AI가 자동으로 음식을 인식하고, OCR로 영양 성분을 분석하여 당뇨 위험도를 실시간으로 알려줍니다.

## 🌟 특징

- **웹 브라우저에서 실행** - 앱 설치 불필요
- **웹캠 지원** - 데스크톱, 노트북 카메라 사용
- **모바일 브라우저 호환** - 스마트폰에서도 접속 가능
- **반응형 디자인** - 다양한 화면 크기 지원
- **빠른 개발 서버** - Vite 기반 Hot Module Replacement (HMR)

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
cd web-app
npm install
```

### 2. 환경 변수 설정 (선택사항)

```bash
# .env 파일 생성
cp .env.example .env

# API URL 수정 (필요시)
# .env 파일:
VITE_API_URL=http://localhost:8000
```

### 3. 백엔드 서버 실행

웹앱을 실행하기 전에 FastAPI 백엔드 서버가 실행되어 있어야 합니다.

```bash
# 새 터미널에서
cd ../backend
python app.py

# 또는 Docker 사용
docker-compose up
```

서버가 http://localhost:8000 에서 실행되는지 확인하세요.

### 4. 웹 애플리케이션 실행

```bash
# web-app 폴더에서
npm run dev
```

브라우저에서 http://localhost:3000 에 접속합니다.

## 📁 프로젝트 구조

```
web-app/
├── public/                 # 정적 파일
├── src/
│   ├── pages/             # 페이지 컴포넌트
│   │   ├── HomePage.jsx   # 홈 화면
│   │   ├── CameraPage.jsx # 카메라 촬영 화면
│   │   └── ResultPage.jsx # 결과 화면
│   ├── services/          # API 서비스
│   │   └── api.js         # FastAPI 통신
│   ├── styles/            # CSS 스타일
│   │   ├── index.css      # 글로벌 스타일
│   │   ├── App.css
│   │   ├── HomePage.css
│   │   ├── CameraPage.css
│   │   └── ResultPage.css
│   ├── App.jsx            # 메인 App 컴포넌트
│   └── main.jsx           # 엔트리 포인트
├── index.html             # HTML 템플릿
├── package.json           # 의존성 관리
├── vite.config.js         # Vite 설정
└── README.md              # 이 파일
```

## 🎯 사용 방법

### 1. 홈 화면

- 서버 상태를 확인합니다
- "음식 분석 시작하기" 버튼을 클릭합니다

### 2. 카메라 화면

- 브라우저에서 카메라 권한을 허용합니다
- 음식이나 음료를 화면 중앙에 맞춥니다
- 촬영 버튼(📷)을 클릭합니다
- 카메라 전환 버튼(🔄)으로 전면/후면 카메라를 변경할 수 있습니다

### 3. 결과 화면

- 감지된 음식 항목을 확인합니다
- 당뇨 위험도 평가를 확인합니다
- 영양 정보 및 OCR 결과를 확인합니다
- "다시 촬영" 또는 "홈으로" 버튼을 클릭합니다

## 🛠 사용 가능한 명령어

```bash
# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 코드 린팅
npm run lint
```

## 🔧 설정

### API URL 변경

`.env` 파일에서 백엔드 서버 주소를 변경할 수 있습니다:

```env
# 로컬 개발
VITE_API_URL=http://localhost:8000

# 네트워크 내 다른 컴퓨터
VITE_API_URL=http://192.168.0.10:8000

# 프로덕션
VITE_API_URL=https://your-api-server.com
```

### Vite 개발 서버 설정

`vite.config.js`에서 포트, 프록시 등을 설정할 수 있습니다:

```javascript
export default defineConfig({
  server: {
    port: 3000,        // 개발 서버 포트
    host: true,        // 네트워크 접속 허용
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
```

## 📱 모바일 브라우저에서 사용하기

### 1. 같은 Wi-Fi 네트워크 연결

개발 컴퓨터와 모바일 기기가 같은 Wi-Fi에 연결되어 있어야 합니다.

### 2. 컴퓨터의 로컬 IP 확인

```bash
# Windows
ipconfig

# macOS/Linux
ifconfig
# 또는
ip addr show
```

예: `192.168.0.10`

### 3. 모바일에서 접속

모바일 브라우저에서 다음 주소로 접속:

```
http://192.168.0.10:3000
```

### 4. HTTPS 필요 (카메라 권한)

모바일 브라우저에서 카메라를 사용하려면 HTTPS가 필요할 수 있습니다. 로컬 개발 시에는 다음 방법을 사용할 수 있습니다:

- `localhost` 또는 `127.0.0.1`은 HTTPS 없이도 카메라 접근 가능
- 네트워크 접속 시에는 ngrok 같은 터널링 서비스 사용

## 🌐 프로덕션 배포

### 1. 빌드

```bash
npm run build
```

`dist/` 폴더에 최적화된 파일들이 생성됩니다.

### 2. 배포 옵션

빌드된 파일을 다음 플랫폼에 배포할 수 있습니다:

- **Vercel**: `vercel --prod`
- **Netlify**: Netlify CLI 또는 웹 인터페이스
- **GitHub Pages**: `gh-pages` 패키지 사용
- **일반 웹 서버**: `dist/` 폴더를 웹 서버에 업로드

### 3. 환경 변수 설정

배포 플랫폼에서 `VITE_API_URL` 환경 변수를 설정하세요.

## 🔍 트러블슈팅

### 카메라가 작동하지 않음

**증상:** 카메라 화면이 검은색으로 표시됨

**해결:**
1. 브라우저 주소창의 카메라 아이콘을 클릭하여 권한을 허용하세요
2. 다른 애플리케이션에서 카메라를 사용 중인지 확인하세요
3. HTTPS 연결인지 확인하세요 (모바일의 경우)
4. 브라우저를 재시작하세요

### API 연결 실패

**증상:** "서버 상태: 오프라인" 표시

**해결:**
1. 백엔드 서버가 실행 중인지 확인: http://localhost:8000/health
2. `.env` 파일의 `VITE_API_URL`이 올바른지 확인
3. CORS 오류인 경우 백엔드의 CORS 설정 확인
4. 방화벽에서 8000 포트가 열려있는지 확인

### 빌드 오류

**증상:** `npm run build` 실패

**해결:**
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install

# 캐시 클리어
npm cache clean --force
```

### 모바일에서 접속 불가

**증상:** 네트워크 주소로 접속이 안 됨

**해결:**
1. 같은 Wi-Fi에 연결되어 있는지 확인
2. 방화벽에서 3000 포트 허용
3. `vite.config.js`에 `host: true` 설정 확인
4. 컴퓨터 IP 주소가 올바른지 재확인

## 🆚 모바일 앱 vs 웹앱

| 기능 | 모바일 앱 | 웹앱 |
|------|----------|------|
| 설치 | 필요 | 불필요 |
| 플랫폼 | Android/iOS | 모든 브라우저 |
| 카메라 | 네이티브 API | getUserMedia |
| 성능 | 우수 | 양호 |
| 배포 | 앱 스토어 | 웹 호스팅 |
| 업데이트 | 재설치 필요 | 자동 |
| 오프라인 | 지원 가능 | 제한적 |

## 📦 의존성

### 프로덕션
- **React** 18.2.0 - UI 라이브러리
- **React Router DOM** 6.20.0 - 라우팅
- **Axios** 1.6.2 - HTTP 클라이언트

### 개발
- **Vite** 5.0.0 - 빌드 도구
- **@vitejs/plugin-react** 4.2.0 - React 플러그인
- **ESLint** 8.53.0 - 코드 린팅

## 🤝 기여

버그 리포트나 기능 제안은 GitHub Issues에 등록해주세요.

## 📄 라이선스

MIT License

---

**백엔드 정보는 메인 프로젝트 README를 참고하세요.**
