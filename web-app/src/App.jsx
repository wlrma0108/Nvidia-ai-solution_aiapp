import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CameraPage from './pages/CameraPage'
import ResultPage from './pages/ResultPage'
import './styles/App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/camera" element={<CameraPage />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
