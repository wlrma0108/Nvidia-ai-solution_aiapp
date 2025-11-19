import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getIntakeLogs, getDailyStats } from '../services/api'
import { IntakeLog, DailyStats } from '../types'
import '../styles/MyPage.css'

export default function MyPage() {
  const { user, token } = useAuth()
  const [logs, setLogs] = useState<IntakeLog[]>([])
  const [stats, setStats] = useState<DailyStats | null>(null)
  const [period, setPeriod] = useState<number>(7)
  const [filterType, setFilterType] = useState<'all' | 'food' | 'drug'>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (token) {
      fetchData()
    }
  }, [token, period, filterType])

  const fetchData = async () => {
    if (!token) return

    setIsLoading(true)

    try {
      const [logsData, statsData] = await Promise.all([
        getIntakeLogs(
          token,
          undefined,
          filterType === 'all' ? undefined : filterType
        ),
        getDailyStats(token, period)
      ])

      setLogs(logsData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRiskColor = (riskLevel: string) => {
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

  const getRiskLabel = (riskLevel: string) => {
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

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="mypage">
      <div className="mypage-container">
        <div className="mypage-header">
          <h1>{user?.name}님의 마이페이지</h1>
          <p>당뇨 관리 현황을 확인하세요</p>
        </div>

        {stats && (
          <div className="stats-section">
            <div className="stats-card main">
              <h2>최근 {period}일 통계</h2>

              <div className="achievement-badge" style={{
                backgroundColor: stats.achieved ? '#4caf50' : '#ff9800'
              }}>
                {stats.achieved ? '목표 달성 🎉' : '목표 미달 ⚠️'}
              </div>

              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-label">총 당 섭취량</div>
                  <div className="stat-value">{stats.totalSugarG.toFixed(1)}g</div>
                </div>

                <div className="stat-item">
                  <div className="stat-label">목표량</div>
                  <div className="stat-value">{stats.targetG.toFixed(1)}g</div>
                </div>

                <div className="stat-item">
                  <div className="stat-label">기록 수</div>
                  <div className="stat-value">{stats.logCount}건</div>
                </div>

                <div className="stat-item">
                  <div className="stat-label">달성률</div>
                  <div className="stat-value">
                    {((stats.totalSugarG / stats.targetG) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="cost-impact-section">
                <h3>💰 비용 영향</h3>
                <div className="cost-message" style={{
                  color: stats.costImpact > 0 ? '#4caf50' : '#f44336'
                }}>
                  {stats.costImpact > 0 ? (
                    <p className="cost-saved">
                      <strong>{stats.costImpact.toLocaleString()}원</strong> 절감 예상
                    </p>
                  ) : (
                    <p className="cost-lost">
                      <strong>{Math.abs(stats.costImpact).toLocaleString()}원</strong> 추가 비용 예상
                    </p>
                  )}
                </div>
                <p className="stats-message">{stats.message}</p>
              </div>

              <div className="period-selector">
                <button
                  className={period === 1 ? 'active' : ''}
                  onClick={() => setPeriod(1)}
                >
                  오늘
                </button>
                <button
                  className={period === 7 ? 'active' : ''}
                  onClick={() => setPeriod(7)}
                >
                  7일
                </button>
                <button
                  className={period === 30 ? 'active' : ''}
                  onClick={() => setPeriod(30)}
                >
                  30일
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="logs-section">
          <div className="logs-header">
            <h2>섭취 기록</h2>
            <div className="filter-buttons">
              <button
                className={filterType === 'all' ? 'active' : ''}
                onClick={() => setFilterType('all')}
              >
                전체
              </button>
              <button
                className={filterType === 'food' ? 'active' : ''}
                onClick={() => setFilterType('food')}
              >
                음식
              </button>
              <button
                className={filterType === 'drug' ? 'active' : ''}
                onClick={() => setFilterType('drug')}
              >
                약물
              </button>
            </div>
          </div>

          {logs.length === 0 ? (
            <div className="empty-logs">
              <p>아직 기록이 없습니다.</p>
              <p>대시보드에서 음식이나 약을 분석해보세요!</p>
            </div>
          ) : (
            <div className="logs-list">
              {logs.map((log) => (
                <div key={log.id} className="log-card">
                  <div className="log-header">
                    <span className="log-type">
                      {log.logType === 'food' ? '🍎 음식' : '💊 약물'}
                    </span>
                    <span
                      className="log-risk-badge"
                      style={{ backgroundColor: getRiskColor(log.riskLevel) }}
                    >
                      {getRiskLabel(log.riskLevel)}
                    </span>
                  </div>

                  <div className="log-time">
                    {formatDate(log.loggedAt)}
                  </div>

                  {log.logType === 'food' && log.estimatedSugarG > 0 && (
                    <div className="log-sugar">
                      예상 당 함량: <strong>{log.estimatedSugarG.toFixed(1)}g</strong>
                    </div>
                  )}

                  {log.summary && (
                    <div className="log-summary">
                      {log.summary}
                    </div>
                  )}

                  <div className="log-score">
                    위험도 점수: {log.riskScore}/100
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
