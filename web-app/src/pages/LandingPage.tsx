import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../styles/LandingPage.css'

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="landing-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="hero-icon">🩺</span>
            Diacare
          </h1>
          <p className="hero-subtitle">당뇨병 환자를 위한 스마트 식단 관리 서비스</p>
          <p className="hero-description">
            AI 기반 음식/약 분석으로 당뇨 관리를 더 쉽고 정확하게
          </p>

          <div className="cta-buttons">
            {user ? (
              <Link to="/dashboard" className="cta-button primary">
                대시보드로 이동
              </Link>
            ) : (
              <>
                <Link to="/register" className="cta-button primary">
                  무료로 시작하기
                </Link>
                <Link to="/login" className="cta-button secondary">
                  로그인
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">주요 기능</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🍎</div>
            <h3 className="feature-title">실시간 음식 분석</h3>
            <p className="feature-description">
              카메라로 음식을 비추면 AI가 즉시 분석하여 당뇨 관리에 도움을 줍니다
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💊</div>
            <h3 className="feature-title">약물 분석</h3>
            <p className="feature-description">
              복용하려는 약이 혈당에 미치는 영향을 미리 확인할 수 있습니다
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">섭취 기록 관리</h3>
            <p className="feature-description">
              일일 당 섭취량을 추적하고 목표 달성 여부를 확인하세요
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3 className="feature-title">비용 절감 효과</h3>
            <p className="feature-description">
              당뇨 관리를 통해 절감할 수 있는 의료비를 한눈에 확인하세요
            </p>
          </div>
        </div>
      </section>

      <section className="how-it-works-section">
        <h2 className="section-title">사용 방법</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3 className="step-title">회원가입</h3>
            <p className="step-description">간단한 정보 입력으로 시작하세요</p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step">
            <div className="step-number">2</div>
            <h3 className="step-title">음식/약 촬영</h3>
            <p className="step-description">카메라로 음식이나 약을 촬영합니다</p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step">
            <div className="step-number">3</div>
            <h3 className="step-title">AI 분석</h3>
            <p className="step-description">AI가 즉시 분석하여 위험도를 알려줍니다</p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step">
            <div className="step-number">4</div>
            <h3 className="step-title">기록 관리</h3>
            <p className="step-description">마이페이지에서 기록을 확인하세요</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2 className="cta-section-title">지금 바로 시작하세요</h2>
        <p className="cta-section-description">
          무료로 Diacare를 사용하고 더 건강한 삶을 시작하세요
        </p>
        {!user && (
          <Link to="/register" className="cta-button large primary">
            무료 회원가입
          </Link>
        )}
      </section>
    </div>
  )
}
