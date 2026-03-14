import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Toast from '../components/Toast'
import Slideshow from '../components/Slideshow'

export default function AlbumPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [album, setAlbum]           = useState(null)
  const [photos, setPhotos]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [uploading, setUploading]   = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragOver, setDragOver]     = useState(false)
  const [slideshow, setSlideshow]   = useState(false)
  const [toast, setToast]           = useState(null)
  const fileInputRef = useRef()

  useEffect(() => { loadData() }, [id])

  async function loadData() {
    setLoading(true)
    const [{ data: albumData }, { data: photoData }] = await Promise.all([
      supabase.from('albums').select('*').eq('id', id).eq('user_id', user.id).single(),
      supabase.from('photos').select('*').eq('album_id', id).order('created_at', { ascending: true })
    ])
    if (!albumData) { navigate('/'); return }
    setAlbum(albumData)
    setPhotos(photoData || [])
    setLoading(false)
  }

  async function handleFiles(files) {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!imageFiles.length) return

    setUploading(true)
    setUploadProgress(0)
    let done = 0
    const newPhotos = []

    for (const file of imageFiles) {
      const ext      = file.name.split('.').pop()
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const path     = `${user.id}/${id}/${filename}`

      const { error: uploadErr } = await supabase.storage
        .from('photos')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (uploadErr) { console.error(uploadErr); continue }

      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(path)

      const { data: photoRow } = await supabase
        .from('photos')
        .insert({ album_id: id, user_id: user.id, url: publicUrl, filename, size: file.size })
        .select()
        .single()

      if (photoRow) newPhotos.push(photoRow)
      done++
      setUploadProgress(Math.round((done / imageFiles.length) * 100))
    }

    // Set album cover if it's the first upload
    if (!album.cover_url && newPhotos.length) {
      await supabase.from('albums').update({ cover_url: newPhotos[0].url }).eq('id', id)
      setAlbum(prev => ({ ...prev, cover_url: newPhotos[0].url }))
    }

    setPhotos(prev => [...prev, ...newPhotos])
    setUploading(false)
    setUploadProgress(0)
    showToast(`${newPhotos.length} foto${newPhotos.length !== 1 ? 's' : ''} adicionada${newPhotos.length !== 1 ? 's' : ''}!`)
  }

  async function deletePhoto(photo) {
    if (!confirm('Apagar esta foto?')) return
    const path = `${user.id}/${id}/${photo.filename}`
    await supabase.storage.from('photos').remove([path])
    await supabase.from('photos').delete().eq('id', photo.id)
    const remaining = photos.filter(p => p.id !== photo.id)
    setPhotos(remaining)
    // Update cover if needed
    if (album.cover_url === photo.url) {
      const newCover = remaining[0]?.url || null
      await supabase.from('albums').update({ cover_url: newCover }).eq('id', id)
      setAlbum(prev => ({ ...prev, cover_url: newCover }))
    }
    showToast('Foto apagada.')
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const onDrop = useCallback(e => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }, [id, album])

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <div className="app-layout">
      <header className="topbar">
        <div className="topbar-logo">Galeria</div>
      </header>

      <main className="page-content">
        <button className="back-btn" onClick={() => navigate('/')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Meus álbuns
        </button>

        <div className="album-page-header">
          <div>
            <h1 className="album-page-title">{album.name}</h1>
            <p className="page-count">{photos.length} foto{photos.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="album-actions">
            {photos.length > 0 && (
              <button className="btn btn-primary" onClick={() => setSlideshow(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Apresentar
              </button>
            )}
            <button className="btn btn-ghost" onClick={() => fileInputRef.current.click()} disabled={uploading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Adicionar fotos
            </button>
          </div>
        </div>

        {/* Upload zone */}
        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => !uploading && fileInputRef.current.click()}
        >
          <div className="upload-zone-icon">📸</div>
          <div className="upload-zone-text">
            <strong>Clique aqui</strong> ou arraste fotos para cá<br />
            <small>JPG, PNG, WEBP — sem limite de quantidade</small>
          </div>
          {uploading && (
            <div className="upload-progress">
              Enviando… {uploadProgress}%
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />

        {/* Photos grid */}
        {photos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🌅</div>
            <div className="empty-state-title">Nenhuma foto ainda</div>
            <div className="empty-state-sub">Faça upload das suas primeiras fotos acima.</div>
          </div>
        ) : (
          <div className="photos-grid">
            {photos.map((photo, i) => (
              <div
                key={photo.id}
                className="photo-card"
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <img src={photo.url} alt="" loading="lazy" />
                <div className="photo-overlay">
                  <button className="photo-delete-btn" onClick={() => deletePhoto(photo)}>
                    Apagar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {slideshow && (
        <Slideshow photos={photos} albumName={album.name} onClose={() => setSlideshow(false)} />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}
