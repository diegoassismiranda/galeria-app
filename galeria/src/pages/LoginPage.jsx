import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate   = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      setError('E-mail ou senha incorretos.')
    } else {
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">Galeria</div>
          <div className="auth-logo-sub">Suas fotos, sua história</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="label">E-mail</label>
            <input
              className="input-field"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="field-group">
            <label className="label">Senha</label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/forgot" className="auth-link">Esqueci minha senha</Link>
        </div>

        <div className="auth-divider">ou</div>

        <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
          Não tem conta?{' '}
          <Link to="/signup" className="auth-link">Criar conta</Link>
        </div>
      </div>
    </div>
  )
}
