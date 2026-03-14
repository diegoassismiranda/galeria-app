import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await resetPassword(email)
    if (error) {
      setError('Não foi possível enviar o e-mail. Verifique o endereço.')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">Galeria</div>
          <div className="auth-logo-sub">Recuperar senha</div>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              E-mail enviado para <strong style={{ color: 'var(--text)' }}>{email}</strong>.<br />
              Clique no link para redefinir sua senha.
            </p>
            <Link to="/login" className="btn btn-ghost">Voltar ao login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>
              Digite seu e-mail e enviaremos um link para você criar uma nova senha.
            </p>
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
            {error && <p className="error-msg">{error}</p>}
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
              {loading ? 'Enviando…' : 'Enviar link de recuperação'}
            </button>
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Link to="/login" className="auth-link" style={{ fontSize: 14 }}>← Voltar ao login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
