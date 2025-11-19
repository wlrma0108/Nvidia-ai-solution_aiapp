import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../styles/Header.css'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-icon">🩺</span>
          <span className="logo-text">Diacare</span>
        </Link>

        <nav className="nav-menu">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">대시보드</Link>
              <Link to="/mypage" className="nav-link">마이페이지</Link>
              <button onClick={handleLogout} className="btn-logout">
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">로그인</Link>
              <Link to="/register" className="btn-register">회원가입</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
