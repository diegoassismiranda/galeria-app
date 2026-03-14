import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Toast from '../components/Toast'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [albums, setAlbums]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [showModal, setShowModal]   = useState(false)
  const [newName, setNewName]       = useState('')
  const [creating, setCreating]     = useState(false)
  const [dropOpen, setDropOpen]     = useState(false)
  const [toast, setToast]           = useState(null)
  const dropRef = useRef()

  useEffect(() => {
    loadAlbums()
  }, [])

  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function loadAlbums() {
    setLoading(true)
    const { data } = await supabase
      .from('albums')
      .select('*, photos(count)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setAlbums(data || [])
    setLoading(false)
  }

  async function createAlbum(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    const { data, error } = await supabase
      .from('albums')
      .insert({ user_id: user.id, name: newName.trim() })
      .select()
      .single()
    if (error) {
      showToast('Erro ao criar álbum.', 'error')
    } else {
      setAlbums(prev => [data, ...prev])
      setShowModal(false)
      setNewName('')
      showToast('Álbum criado com sucesso!', 'success')
    }
    setCreating(false)
  }

  async function deleteAlbum(id, e) {
    e.stopPropagation()
    if (!confirm('Tem certeza que quer apagar este álbum e todas as fotos?')) return
    await supabase.from('albums').delete().eq('id', id)
    setAlbums(prev => prev.filter(a => a.id !== id))
    showToast('Álbum apagado.', 'success')
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const initial = user?.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <div className="app-layout">
      {/* Top Bar */}
      <header className="topbar">
        <div className="topbar-logo">Galeria</div>
        <div className="topbar-actions">
          <div className="dropdown" ref={dropRef}>
            <div className="avatar" onClick={() => setDropOpen(v => !v)}>{initial}</div>
            {dropOpen && (
              <div className="dropdown-menu">
                <div style={{ padding: '10px 16px 6px', fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</div>
                <button className="dropdown-item danger" onClick={handleSignOut}>Sair</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Meus Álbuns</h1>
            {!loading && <p className="page-count">{albums.length} álbum{albums.length !== 1 ? 's' : ''}</p>}
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Novo álbum
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <div className="spinner" />
          </div>
        ) : (
          <div className="albums-grid">
            {/* New album card */}
            <div className="new-album-card" onClick={() => setShowModal(true)}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span style={{ fontSize: 14 }}>Criar álbum</span>
            </div>

            {albums.map((album, i) => (
              <AlbumCard
                key={album.id}
                album={album}
                style={{ animationDelay: `${i * 0.04}s` }}
                onClick={() => navigate(`/album/${album.id}`)}
                onDelete={(e) => deleteAlbum(album.id, e)}
              />
            ))}
          </div>
        )}

        {!loading && albums.length === 0 && (
          <div className="empty-state" style={{ marginTop: 40 }}>
            <div className="empty-state-icon">🖼️</div>
            <div className="empty-state-title">Nenhum álbum ainda</div>
            <div className="empty-state-sub">Crie seu primeiro álbum para começar.</div>
          </div>
        )}
      </main>

      {/* Create Album Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Novo álbum</h2>
            <form onSubmit={createAlbum}>
              <div className="field-group">
                <label className="label">Nome do álbum</label>
                <input
                  className="input-field"
                  placeholder="Ex: Casamento da Ana, Viagem a Paris…"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Criando…' : 'Criar álbum'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}

function AlbumCard({ album, style, onClick, onDelete }) {
  const count = album.photos?.[0]?.count ?? 0
  return (
    <div className="album-card" style={style} onClick={onClick}>
      <div className="album-cover">
        {album.cover_url ? (
          <img src={album.cover_url} alt={album.name} />
        ) : (
          <div className="album-cover-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span style={{ fontSize: 12 }}>Vazio</span>
          </div>
        )}
      </div>
      <div className="album-info">
        <div className="album-name">{album.name}</div>
        <div className="album-meta">
          <span>{count} foto{count !== 1 ? 's' : ''}</span>
          <button
            className="btn"
            style={{ padding: '2px 8px', fontSize: 12, color: 'var(--danger)', background: 'none' }}
            onClick={onDelete}
          >
            Apagar
          </button>
        </div>
      </div>
    </div>
  )
}
