import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { checkHealth } from '../services/api'
import '../styles/HomePage.css'

function HomePage() {
  const navigate = useNavigate()
  const [serverStatus, setServerStatus] = useState('checking')

  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        await checkHealth()
        setServerStatus('online')
      } catch (error) {
        setServerStatus('offline')
      }
    }

    checkServerHealth()
  }, [])

  const handleStartAnalysis = () => {
    if (serverStatus === 'offline') {
      alert('백엔드 서버가 실행되지 않았습니다.\nhttp://localhost:8000 에서 서버를 먼저 시작해주세요.')
      return
    }
    navigate('/camera')
  }

  return (
    <div className="home-page">
      <div className="home-container">
        <div className="home-header">
          <h1 className="home-title">🍎 당뇨 케어</h1>
          <p className="home-subtitle">AI 기반 음식 건강 영향 분석</p>
        </div>

        <div className="home-features">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>실시간 음식 감지</h3>
            <p>YOLO AI로 과일과 음료를 자동 인식</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>영양 성분 분석</h3>
            <p>OCR로 음료 라벨의 영양 정보 추출</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚕️</div>
            <h3>당뇨 위험도 평가</h3>
            <p>실시간으로 건강 영향 분석 및 조언</p>
          </div>
        </div>

        <div className="server-status">
          <div className={`status-indicator ${serverStatus}`}>
            <span className="status-dot"></span>
            <span className="status-text">
              서버 상태: {
                serverStatus === 'checking' ? '확인 중...' :
                serverStatus === 'online' ? '정상' : '오프라인'
              }
            </span>
          </div>
        </div>

        <button
          className="start-button"
          onClick={handleStartAnalysis}
          disabled={serverStatus === 'checking'}
        >
          <span className="button-icon">📷</span>
          음식 분석 시작하기
        </button>

        <div className="home-footer">
          <p className="footer-text">
            카메라로 음식이나 음료를 촬영하면<br />
            AI가 자동으로 분석하여 당뇨 위험도를 알려드립니다
          </p>
        </div>
      </div>
    </div>
  )
}

export default HomePage
