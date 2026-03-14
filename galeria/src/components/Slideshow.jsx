import { useState, useEffect, useCallback, useRef } from 'react'

const TRANSITIONS = [
  { value: 'fade',  label: 'Fade (dissolve)' },
  { value: 'slide', label: 'Slide (deslizar)' },
  { value: 'zoom',  label: 'Zoom (ampliar)'  },
]

export default function Slideshow({ photos, albumName, onClose }) {
  const [index,      setIndex]      = useState(0)
  const [playing,    setPlaying]    = useState(true)
  const [transition, setTransition] = useState('fade')
  const [interval,   setIntervalMs] = useState(4000)
  const [animKey,    setAnimKey]    = useState(0)
  const timerRef = useRef()

  const goTo = useCallback((i) => {
    setIndex(i)
    setAnimKey(k => k + 1)
  }, [])

  const next = useCallback(() => goTo((index + 1) % photos.length), [index, photos.length, goTo])
  const prev = useCallback(() => goTo((index - 1 + photos.length) % photos.length), [index, photos.length, goTo])

  // Keyboard navigation
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next() }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); prev() }
      if (e.key === 'Escape')     onClose()
      if (e.key === 'p' || e.key === 'P') setPlaying(v => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, onClose])

  // Auto-play
  useEffect(() => {
    clearInterval(timerRef.current)
    if (playing) {
      timerRef.current = setInterval(next, interval)
    }
    return () => clearInterval(timerRef.current)
  }, [playing, interval, next])

  const photo = photos[index]

  return (
    <div className="slideshow-overlay">
      {/* Main photo */}
      <div className="slideshow-main">
        <img
          key={animKey}
          src={photo.url}
          alt=""
          className={`slideshow-img ${transition}-enter`}
        />

        {/* Navigation arrows */}
        {photos.length > 1 && (
          <>
            <button className="ss-nav prev" onClick={prev} title="Anterior (←)">‹</button>
            <button className="ss-nav next" onClick={next} title="Próxima (→)">›</button>
          </>
        )}
      </div>

      {/* Control bar */}
      <div className="slideshow-bar">

        {/* Play / Pause */}
        <div className="ss-control">
          <button className={`ss-btn ${playing ? 'active' : ''}`} onClick={() => setPlaying(v => !v)} title="Play/Pause (P)">
            {playing ? '⏸' : '▶'}
          </button>
        </div>

        {/* Speed */}
        <div className="ss-control">
          <span className="ss-label">Velocidade</span>
          <select
            className="ss-select"
            value={interval}
            onChange={e => setIntervalMs(Number(e.target.value))}
          >
            <option value={1500}>Rápido (1.5s)</option>
            <option value={3000}>Normal (3s)</option>
            <option value={4000}>Médio (4s)</option>
            <option value={6000}>Lento (6s)</option>
            <option value={10000}>Muito lento (10s)</option>
          </select>
        </div>

        {/* Transition */}
        <div className="ss-control">
          <span className="ss-label">Transição</span>
          <select
            className="ss-select"
            value={transition}
            onChange={e => setTransition(e.target.value)}
          >
            {TRANSITIONS.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Album name */}
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginLeft: 8 }}>
          {albumName}
        </div>

        {/* Counter */}
        <div className="ss-counter">
          {index + 1} / {photos.length}
        </div>

        {/* Close */}
        <button className="ss-close" onClick={onClose} title="Fechar (Esc)">
          ✕ Sair
        </button>
      </div>
    </div>
  )
}
