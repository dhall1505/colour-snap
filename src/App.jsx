import { useEffect, useRef, useState } from 'react'
import './App.css'

const COLOURS = [
  { name: 'red', hex: '#E5484D', text: '#ffffff' },
  { name: 'blue', hex: '#2F6FE4', text: '#ffffff' },
  { name: 'green', hex: '#2FA84F', text: '#ffffff' },
  { name: 'yellow', hex: '#F4C430', text: '#1a1823' },
  { name: 'orange', hex: '#F2762E', text: '#ffffff' },
  { name: 'purple', hex: '#8B5CF6', text: '#ffffff' },
]

const TOTAL_ROUNDS = 5

function randomColour(excludeName) {
  const options = excludeName
    ? COLOURS.filter((c) => c.name !== excludeName)
    : COLOURS
  return options[Math.floor(Math.random() * options.length)]
}

function randomScore() {
  return Math.floor(Math.random() * 41) + 60 // 60-100 inclusive
}

export default function App() {
  const [phase, setPhase] = useState('playing') // 'playing' | 'final'
  const [currentColour, setCurrentColour] = useState(() => randomColour())
  const [rounds, setRounds] = useState([]) // { colour, score }
  const [cameraState, setCameraState] = useState('idle')
  // idle | requesting | active | captured | denied | unavailable
  const [capturedImage, setCapturedImage] = useState(null)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const roundNumber = Math.min(rounds.length + 1, TOTAL_ROUNDS)
  const totalScore = rounds.reduce((sum, r) => sum + r.score, 0)
  const lastScore = rounds.length ? rounds[rounds.length - 1].score : null

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }

  useEffect(() => {
    if (cameraState === 'active' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [cameraState])

  useEffect(() => stopStream, [])

  const openCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('unavailable')
      return
    }
    setCameraState('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      streamRef.current = stream
      setCameraState('active')
    } catch (err) {
      if (err && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
        setCameraState('denied')
      } else {
        setCameraState('unavailable')
      }
    }
  }

  const takePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const width = video.videoWidth || 720
    const height = video.videoHeight || 960
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    // Mirror the capture to match the mirrored preview.
    ctx.translate(width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, width, height)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    setCapturedImage(dataUrl)
    stopStream()

    const score = randomScore()
    setRounds((prev) => [...prev, { colour: currentColour, score }])
    setCameraState('captured')
  }

  const goToNext = () => {
    stopStream()
    if (rounds.length >= TOTAL_ROUNDS) {
      setPhase('final')
      return
    }
    setCurrentColour(randomColour(currentColour.name))
    setCapturedImage(null)
    setCameraState('idle')
  }

  const playAgain = () => {
    stopStream()
    setRounds([])
    setCapturedImage(null)
    setCameraState('idle')
    setCurrentColour(randomColour())
    setPhase('playing')
  }

  if (phase === 'final') {
    return (
      <div className="app">
        <div className="final-screen">
          <p className="final-screen__eyebrow">Game over</p>
          <p className="final-screen__total">
            {totalScore}
            <span> / {TOTAL_ROUNDS * 100}</span>
          </p>
          <div className="round-breakdown">
            {rounds.map((r, i) => (
              <div className="round-breakdown__row" key={i}>
                <span className="round-breakdown__colour">
                  <span className="swatch" style={{ background: r.colour.hex }} />
                  {r.colour.name}
                </span>
                <span className="round-breakdown__score">{r.score}%</span>
              </div>
            ))}
          </div>
          <button className="big-button big-button--primary" onClick={playAgain}>
            Play Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="status-bar">
        <span className="round-pill">
          Round {roundNumber} of {TOTAL_ROUNDS}
        </span>
        <span className="score-pill">Score: {totalScore}</span>
      </div>

      <div
        className="colour-card"
        style={{ background: currentColour.hex, color: currentColour.text }}
      >
        <p className="colour-card__prompt">Find something this colour</p>
        <p className="colour-card__name">{currentColour.name}</p>
      </div>

      <div className="camera-section">
        {cameraState === 'idle' && (
          <>
            <button className="big-button big-button--primary" onClick={openCamera}>
              Open Camera
            </button>
            <p className="camera-hint">
              Point your camera at something {currentColour.name} and snap a photo.
            </p>
          </>
        )}

        {cameraState === 'requesting' && (
          <p className="camera-hint">Requesting camera access…</p>
        )}

        {cameraState === 'active' && (
          <>
            <div className="video-frame">
              <video ref={videoRef} autoPlay muted playsInline />
            </div>
            <button className="big-button big-button--shutter" onClick={takePhoto}>
              Take Photo
            </button>
          </>
        )}

        {cameraState === 'denied' && (
          <div className="camera-error">
            <p className="camera-error__title">Camera access denied</p>
            <p className="camera-error__body">
              Colour Snap needs camera permission to take a photo. Check your browser's
              site settings to allow camera access, then try again.
            </p>
            <button className="big-button big-button--primary" onClick={openCamera}>
              Try Again
            </button>
          </div>
        )}

        {cameraState === 'unavailable' && (
          <div className="camera-error">
            <p className="camera-error__title">Camera unavailable</p>
            <p className="camera-error__body">
              We couldn't find or start a camera on this device. Make sure no other app
              is using it, and that you're on a secure (HTTPS) connection.
            </p>
            <button className="big-button big-button--primary" onClick={openCamera}>
              Try Again
            </button>
          </div>
        )}

        {cameraState === 'captured' && capturedImage && (
          <>
            <div className="captured-frame">
              <img src={capturedImage} alt={`Photo of something ${currentColour.name}`} />
              <span className="score-badge">{lastScore}%</span>
            </div>
            <p className="result-caption">
              {lastScore >= 85 ? 'Great match!' : lastScore >= 70 ? 'Nice find!' : 'Good try!'}
            </p>
            <button className="big-button big-button--primary" onClick={goToNext}>
              {rounds.length >= TOTAL_ROUNDS ? 'See Final Score' : 'Next Colour'}
            </button>
          </>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}
