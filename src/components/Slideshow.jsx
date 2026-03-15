import { useState, useEffect, useCallback, useRef } from 'react'

const TRANSITIONS = [
  { value: 'fade',    label: '✦ Fade (dissolve)'   },
  { value: 'slide',   label: '→ Slide (deslizar)'  },
  { value: 'zoom',    label: '⊕ Zoom (ampliar)'    },
  { value: 'flip',    label: '↻ Flip (girar)'      },
  { value: 'blur',    label: '◎ Blur (desfoque)'   },
  { value: 'curtain', label: '▶ Cortina'            },
  { value: 'drop',    label: '↓ Drop (cair)'       },
]

const SPEEDS = [
  { value: 1500,  label: '1.5s — Rápido'     },
  { value: 3000,  label: '3s — Normal'        },
  { value: 5000,  label: '5s — Médio'         },
  { value: 8000,  label: '8s — Lento'         },
  { value: 12000, label: '12s — Muito lento'  },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Slideshow({ photos: originalPhotos, albumName, onClose }) {
  const [photos, setPhotos]         = useState(originalPhotos)
  const [index, setIndex]           = useState(0)
  const [playing, setPlaying]       = useState(true)
  const [transition, setTransition] = useState('fade')
  const [speed, setSpeed]           = useState(5000)
  const [animKey, setAnimKey]       = useState(0)
  const [kiosk, setKiosk]           = useState(false)
  const [shuffled, setShuffled]     = useState(false)
  const [barVisible, setBarVisible] = useState(true)
  const [progress, setProgress]     = useState(0)

  const timerRef    = useRef()
  const progressRef = useRef()
  const progressStart = useRef()
  const hideBarTimer = useRef()

  const goTo = useCallback((i) => {
    setIndex(i)
    setAnimKey(k => k + 1)
    setProgress(0)
    progressStart.current = Date.now()
  }, [])

  const next = useCallback((list, idx) => {
    goTo((idx + 1) % list.length)
  }, [goTo])

  const prev = useCallback(() => {
    goTo((index - 1 + photos.length) % photos.length)
  }, [index, photos.length, goTo])

  // Auto-play timer
  useEffect(() => {
    clearInterval(timerRef.current)
    if (playing) {
      progressStart.current = Date.now()
      setProgress(0)
      timerRef.current = setInterval(() => {
        setIndex(i => {
          const nextIdx = (i + 1) % photos.length
          goTo(nextIdx)
          return nextIdx
        })
      }, speed)
    }
    return () => clearInterval(timerRef.current)
  }, [playing, speed, photos.length])

  // Progress bar animation
  useEffect(() => {
    cancelAnimationFrame(progressRef.current)
    if (!playing) return
    progressStart.current = Date.now()

    function tick() {
      const elapsed = Date.now() - progressStart.current
      const pct = Math.min((elapsed / speed) * 100, 100)
      setProgress(pct)
      if (pct < 100) progressRef.current = requestAnimationFrame(tick)
    }
    progressRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(progressRef.current)
  }, [playing, speed, animKey])

  // Keyboard
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(photos, index) }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); prev() }
      if (e.key === 'Escape')     onClose()
      if (e.key === 'p' || e.key === 'P') setPlaying(v => !v)
      if (e.key === 'k' || e.key === 'K') toggleKiosk()
      showBar()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, onClose, index, photos])

  // Kiosk auto-hide bar
  function showBar() {
    setBarVisible(true)
    clearTimeout(hideBarTimer.current)
    if (kiosk) {
      hideBarTimer.current = setTimeout(() => setBarVisible(false), 3000)
    }
  }

  function toggleKiosk() {
    const el = document.documentElement
    if (!kiosk) {
      el.requestFullscreen?.()
      setKiosk(true)
      hideBarTimer.current = setTimeout(() => setBarVisible(false), 3000)
    } else {
      document.exitFullscreen?.()
      setKiosk(false)
      setBarVisible(true)
      clearTimeout(hideBarTimer.current)
    }
  }

  function toggleShuffle() {
    if (shuffled) {
      setPhotos(originalPhotos)
      setShuffled(false)
    } else {
      setPhotos(shuffle(originalPhotos))
      setShuffled(true)
    }
    setIndex(0)
    setAnimKey(k => k + 1)
  }

  const photo = photos[index]

  return (
    <div
      className={`slideshow-overlay${kiosk ? ' kiosk' : ''}`}
      onMouseMove={showBar}
    >
      {/* Main photo */}
      <div className="slideshow-main">
        <img
          key={animKey}
          src={photo.url}
          alt={photo.caption || ''}
          className={`slideshow-img ${transition}-enter`}
        />

        {/* Progress bar */}
        {playing && (
          <div className="ss-progress" style={{ width: `${progress}%`, transition: progress === 0 ? 'none' : `width ${speed}ms linear` }} />
        )}

        {/* Caption */}
        {photo.caption && (
          <div className="ss-caption">
            <div className="ss-caption-text">{photo.caption}</div>
          </div>
        )}

        {/* Nav arrows */}
        {photos.length > 1 && !kiosk && (
          <>
            <button className="ss-nav prev" onClick={prev} title="Anterior (←)">‹</button>
            <button className="ss-nav next" onClick={() => next(photos, index)} title="Próxima (→)">›</button>
          </>
        )}
      </div>

      {/* Control bar */}
      <div className={`slideshow-bar${!barVisible ? ' hidden' : ''}`}>

        {/* Play/Pause */}
        <div className="ss-control">
          <button className={`ss-btn ${playing ? 'active' : ''}`} onClick={() => setPlaying(v => !v)} title="Play/Pause (P)">
            {playing ? '⏸' : '▶'}
          </button>
        </div>

        {/* Speed */}
        <div className="ss-control">
          <span className="ss-label">Tempo</span>
          <select className="ss-select" value={speed} onChange={e => setSpeed(Number(e.target.value))}>
            {SPEEDS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Transition */}
        <div className="ss-control">
          <span className="ss-label">Transição</span>
          <select className="ss-select" value={transition} onChange={e => setTransition(e.target.value)}>
            {TRANSITIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {/* Shuffle */}
        <div className="ss-control">
          <button
            className={`ss-btn ${shuffled ? 'active' : ''}`}
            onClick={toggleShuffle}
            title="Embaralhar fotos"
            style={{ fontSize: 14 }}
          >
            🔀
          </button>
          <span className="ss-label" style={{ fontSize: 10 }}>Shuffle</span>
        </div>

        {/* Kiosk */}
        <div className="ss-control">
          <button
            className={`ss-btn ${kiosk ? 'active' : ''}`}
            onClick={toggleKiosk}
            title="Modo quiosque — tela cheia sem controles (K)"
            style={{ fontSize: 13 }}
          >
            {kiosk ? '⊡' : '⛶'}
          </button>
          <span className="ss-label" style={{ fontSize: 10 }}>Quiosque</span>
        </div>

        {/* Album name */}
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginLeft: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
          {shuffled && <span style={{ color: 'var(--accent)', fontSize: 10 }}>ALEATÓRIO</span>}
          {albumName}
        </div>

        {/* Counter */}
        <div className="ss-counter">{index + 1} / {photos.length}</div>

        {/* Close */}
        <button className="ss-close" onClick={onClose} title="Fechar (Esc)">✕ Sair</button>
      </div>

      {/* Kiosk hint */}
      {kiosk && barVisible && (
        <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.5)', padding: '6px 12px', borderRadius: 8, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
          Pressione K ou Esc para sair do quiosque
        </div>
      )}
    </div>
  )
}
