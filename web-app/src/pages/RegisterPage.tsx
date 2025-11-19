import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../styles/AuthPages.css'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    birthYear: '',
    gender: '',
    usesInsulin: false,
    dailySugarTargetG: '50'
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }

    setIsLoading(true)

    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        birthYear: formData.birthYear ? parseInt(formData.birthYear) : undefined,
        gender: formData.gender || undefined,
        usesInsulin: formData.usesInsulin,
        dailySugarTargetG: parseFloat(formData.dailySugarTargetG)
      })

      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || '회원가입에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card large">
          <h1 className="auth-title">회원가입</h1>
          <p className="auth-subtitle">Diacare와 함께 당뇨 관리를 시작하세요</p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">이메일 *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">비밀번호 *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="6자 이상"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">비밀번호 확인 *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="비밀번호 재입력"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="name">이름 *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="홍길동"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="birthYear">출생연도</label>
                <input
                  type="number"
                  id="birthYear"
                  name="birthYear"
                  value={formData.birthYear}
                  onChange={handleChange}
                  placeholder="1990"
                  min="1900"
                  max={new Date().getFullYear()}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">성별</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="">선택하지 않음</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="dailySugarTargetG">일일 당 섭취 목표 (g) *</label>
              <input
                type="number"
                id="dailySugarTargetG"
                name="dailySugarTargetG"
                value={formData.dailySugarTargetG}
                onChange={handleChange}
                placeholder="50"
                min="10"
                max="200"
                step="0.1"
                required
                disabled={isLoading}
              />
              <small>권장: 50g 이하</small>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="usesInsulin"
                  checked={formData.usesInsulin}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <span>인슐린을 투여 중입니다</span>
              </label>
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading ? '가입 중...' : '회원가입'}
            </button>
          </form>

          <div className="auth-footer">
            <p>이미 계정이 있으신가요? <Link to="/login">로그인</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
