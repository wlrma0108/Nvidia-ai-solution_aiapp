import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyzeFoodImage } from '../services/api'
import '../styles/CameraPage.css'

function CameraPage() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState(null)
  const [stream, setStream] = useState(null)
  const [facingMode, setFacingMode] = useState('environment')

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [facingMode])

  const startCamera = async () => {
    try {
      setError(null)

      if (stream) {
        stopCamera()
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
      }
    } catch (err) {
      console.error('Camera error:', err)
      setError('카메라를 시작할 수 없습니다. 카메라 권한을 확인해주세요.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return

    try {
      setIsAnalyzing(true)

      const video = videoRef.current
      const canvas = canvasRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0)

      canvas.toBlob(async (blob) => {
        try {
          const result = await analyzeFoodImage(blob)

          stopCamera()

          navigate('/result', {
            state: {
              result,
              imageUrl: URL.createObjectURL(blob)
            }
          })
        } catch (error) {
          setError(error.message)
          setIsAnalyzing(false)
        }
      }, 'image/jpeg', 0.95)
    } catch (error) {
      console.error('Capture error:', error)
      setError('사진 촬영 중 오류가 발생했습니다.')
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="camera-page">
      <div className="camera-container">
        <div className="camera-header">
          <button
            className="back-button"
            onClick={() => {
              stopCamera()
              navigate('/')
            }}
            disabled={isAnalyzing}
          >
            ← 뒤로
          </button>
          <h2 className="camera-title">음식 촬영</h2>
          <button
            className="switch-camera-button"
            onClick={switchCamera}
            disabled={isAnalyzing}
            title="카메라 전환"
          >
            🔄
          </button>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => { setError(null); startCamera(); }}>
              다시 시도
            </button>
          </div>
        )}

        <div className="video-container">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-video"
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          <div className="camera-overlay">
            <div className="guide-text">
              <p>음식이나 음료를 화면 중앙에 맞춰주세요</p>
              <p className="guide-subtext">음료는 영양 성분표가 보이도록 촬영하세요</p>
            </div>

            <div className="focus-frame">
              <div className="corner corner-tl"></div>
              <div className="corner corner-tr"></div>
              <div className="corner corner-bl"></div>
              <div className="corner corner-br"></div>
            </div>
          </div>
        </div>

        <div className="camera-controls">
          {isAnalyzing ? (
            <div className="analyzing-container">
              <div className="spinner"></div>
              <p className="analyzing-text">분석 중...</p>
              <p className="analyzing-subtext">잠시만 기다려주세요</p>
            </div>
          ) : (
            <>
              <button
                className="capture-button"
                onClick={capturePhoto}
                disabled={!!error || isAnalyzing}
              >
                <div className="capture-button-inner">
                  <span className="camera-icon">📷</span>
                </div>
              </button>
              <p className="capture-hint">클릭하여 촬영</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CameraPage
