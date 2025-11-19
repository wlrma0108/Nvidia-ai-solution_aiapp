import { useState, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { detectFood, detectDrug } from '../services/api'
import '../styles/DashboardPage.css'

type TabType = 'food' | 'drug'

export default function DashboardPage() {
  const { user, token } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('food')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.')
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      setImagePreview(event.target?.result as string)
      setResult(null)
      setError(null)
    }

    reader.readAsDataURL(file)
  }

  const handleAnalyze = async () => {
    if (!imagePreview || !token) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const blob = await fetch(imagePreview).then(r => r.blob())

      let analysisResult

      if (activeTab === 'food') {
        analysisResult = await detectFood(blob, token)
      } else {
        analysisResult = await detectDrug(blob, token)
      }

      setResult(analysisResult)
    } catch (err: any) {
      setError(err.message || '분석 중 오류가 발생했습니다.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setImagePreview(null)
    setResult(null)
    setError(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getRiskColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'GOOD':
        return '#4caf50'
      case 'WARNING':
        return '#ff9800'
      case 'BAD':
        return '#f44336'
      default:
        return '#999'
    }
  }

  const getRiskLabel = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'GOOD':
        return '안전'
      case 'WARNING':
        return '주의'
      case 'BAD':
        return '위험'
      default:
        return '알 수 없음'
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>안녕하세요, {user?.name}님</h1>
          <p>음식이나 약을 촬영하여 당뇨 관리에 도움을 받으세요</p>
        </div>

        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === 'food' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('food')
              handleReset()
            }}
          >
            🍎 음식/음료 분석
          </button>
          <button
            className={`tab-button ${activeTab === 'drug' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('drug')
              handleReset()
            }}
          >
            💊 약물 분석
          </button>
        </div>

        <div className="analysis-section">
          {!imagePreview ? (
            <div className="upload-area">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="file-input"
              />
              <label htmlFor="file-input" className="upload-label">
                <div className="upload-icon">📸</div>
                <h3>이미지를 선택하세요</h3>
                <p>
                  {activeTab === 'food'
                    ? '음식이나 음료 사진을 업로드하세요'
                    : '약 패키지 사진을 업로드하세요'}
                </p>
                <button className="upload-button">파일 선택</button>
              </label>
            </div>
          ) : (
            <div className="analysis-container">
              <div className="image-preview-section">
                <img src={imagePreview} alt="Preview" className="preview-image" />
                <div className="image-actions">
                  <button onClick={handleReset} className="btn-secondary">
                    다시 선택
                  </button>
                  {!result && (
                    <button
                      onClick={handleAnalyze}
                      className="btn-primary"
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? '분석 중...' : '분석하기'}
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <div className="result-section error">
                  <h3>오류</h3>
                  <p>{error}</p>
                </div>
              )}

              {result && (
                <div className="result-section">
                  {result.detected ? (
                    <>
                      <div
                        className="risk-badge"
                        style={{ backgroundColor: getRiskColor(result.riskLevel) }}
                      >
                        {getRiskLabel(result.riskLevel)}
                      </div>

                      {activeTab === 'food' && (
                        <>
                          <h3>음식 분석 결과</h3>
                          <div className="result-item">
                            <strong>인식된 음식:</strong> {result.foodType}
                          </div>
                          {result.estimatedSugarG !== undefined && (
                            <div className="result-item">
                              <strong>예상 당 함량:</strong> {result.estimatedSugarG}g
                            </div>
                          )}
                          <div className="result-item">
                            <strong>위험도 메시지:</strong>
                            <p className="risk-message">{result.riskMessage}</p>
                          </div>
                          {result.ocrTexts && result.ocrTexts.length > 0 && (
                            <div className="result-item">
                              <strong>인식된 텍스트:</strong>
                              <ul className="ocr-list">
                                {result.ocrTexts.map((text: string, idx: number) => (
                                  <li key={idx}>{text}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      )}

                      {activeTab === 'drug' && (
                        <>
                          <h3>약물 분석 결과</h3>
                          {result.drugInfo?.name && (
                            <div className="result-item">
                              <strong>약물명:</strong> {result.drugInfo.name}
                            </div>
                          )}
                          {result.drugInfo?.dosage && (
                            <div className="result-item">
                              <strong>용량:</strong> {result.drugInfo.dosage}
                            </div>
                          )}
                          {result.drugInfo?.ingredients && result.drugInfo.ingredients.length > 0 && (
                            <div className="result-item">
                              <strong>성분:</strong>
                              <ul className="ingredient-list">
                                {result.drugInfo.ingredients.map((ing: string, idx: number) => (
                                  <li key={idx}>{ing}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="result-item">
                            <strong>위험도 평가:</strong>
                            <p className="risk-message">{result.riskMessage}</p>
                          </div>
                        </>
                      )}

                      <div className="result-actions">
                        <button onClick={handleReset} className="btn-primary">
                          새로운 분석 시작
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="no-detection">
                      <p>{result.message || '인식된 항목이 없습니다.'}</p>
                      <button onClick={handleReset} className="btn-secondary">
                        다시 시도
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
