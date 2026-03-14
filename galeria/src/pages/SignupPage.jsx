import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function SignupPage() {
  const { signUp } = useAuth()
  const navigate   = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return }
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    setLoading(true)
    const { error } = await signUp(email, password)
    if (error) {
      setError(error.message === 'User already registered' ? 'Este e-mail já está cadastrado.' : 'Erro ao criar conta. Tente novamente.')
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>✉️</div>
          <h2 className="auth-title">Confirme seu e-mail</h2>
          <p className="auth-subtitle">
            Enviamos um link de confirmação para <strong>{email}</strong>. Clique no link para ativar sua conta.
          </p>
          <Link to="/login" className="btn btn-ghost" style={{ marginTop: 24, display: 'inline-flex' }}>
            Voltar ao login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">Galeria</div>
          <div className="auth-logo-sub">Criar nova conta</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="label">E-mail</label>
            <input className="input-field" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="field-group">
            <label className="label">Senha</label>
            <input className="input-field" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className="field-group">
            <label className="label">Confirmar senha</label>
            <input className="input-field" type="password" placeholder="Repita a senha" value={confirm} onChange={e => setConfirm(e.target.value)} required />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? 'Criando conta…' : 'Criar conta'}
          </button>
        </form>

        <div className="auth-divider">ou</div>

        <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
          Já tem conta?{' '}
          <Link to="/login" className="auth-link">Entrar</Link>
        </div>
      </div>
    </div>
  )
}
