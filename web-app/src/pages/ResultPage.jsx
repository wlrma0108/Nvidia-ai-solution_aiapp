import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import '../styles/ResultPage.css'

function ResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { result, imageUrl } = location.state || {}

  useEffect(() => {
    if (!result || !imageUrl) {
      navigate('/')
    }
  }, [result, imageUrl, navigate])

  if (!result || !imageUrl) {
    return null
  }

  const getRiskColor = (risk) => {
    const colors = {
      '안전': '#4CAF50',
      '주의': '#FF9800',
      '위험': '#F44336'
    }
    return colors[risk] || '#9E9E9E'
  }

  const getRiskIcon = (risk) => {
    const icons = {
      '안전': '✅',
      '주의': '⚠️',
      '위험': '🚨'
    }
    return icons[risk] || 'ℹ️'
  }

  return (
    <div className="result-page">
      <div className="result-container">
        <div className="result-header">
          <h2 className="result-title">분석 결과</h2>
        </div>

        <div className="result-content">
          <div className="image-section">
            <img
              src={imageUrl}
              alt="촬영한 음식"
              className="result-image"
            />
          </div>

          <div className="analysis-section">
            <div className="detected-items">
              <h3 className="section-title">감지된 항목</h3>
              {result.detected_items && result.detected_items.length > 0 ? (
                <ul className="items-list">
                  {result.detected_items.map((item, index) => (
                    <li key={index} className="item">
                      <span className="item-name">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-items">감지된 항목이 없습니다</p>
              )}
            </div>

            {result.risk_level && (
              <div
                className="risk-card"
                style={{ borderColor: getRiskColor(result.risk_level) }}
              >
                <div className="risk-header">
                  <span className="risk-icon">
                    {getRiskIcon(result.risk_level)}
                  </span>
                  <h3
                    className="risk-title"
                    style={{ color: getRiskColor(result.risk_level) }}
                  >
                    당뇨 위험도: {result.risk_level}
                  </h3>
                </div>
                {result.message && (
                  <p className="risk-message">{result.message}</p>
                )}
              </div>
            )}

            {result.nutrition_info && (
              <div className="nutrition-section">
                <h3 className="section-title">영양 정보</h3>
                <div className="nutrition-grid">
                  {Object.entries(result.nutrition_info).map(([key, value]) => (
                    <div key={key} className="nutrition-item">
                      <span className="nutrition-label">{key}</span>
                      <span className="nutrition-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.ocr_text && result.ocr_text.length > 0 && (
              <div className="ocr-section">
                <h3 className="section-title">인식된 텍스트</h3>
                <div className="ocr-text">
                  {result.ocr_text.join('\n')}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="result-actions">
          <button
            className="action-button secondary"
            onClick={() => navigate('/camera')}
          >
            다시 촬영
          </button>
          <button
            className="action-button primary"
            onClick={() => navigate('/')}
          >
            홈으로
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResultPage
