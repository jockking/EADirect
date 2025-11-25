import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email, password)
      if (result.success) {
        navigate(from, { replace: true })
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)'
    }}>
      <div className="card" style={{ maxWidth: '420px', width: '100%', margin: '1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="nav-logo" style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 1rem',
            fontSize: '32px'
          }}>
            EA
          </div>
          <h2 style={{ marginBottom: '0.5rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Sign in to Enterprise Architecture Tool
          </p>
        </div>

        {error && (
          <div className="error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ea.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="button"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: '2rem',
          padding: '1.25rem',
          background: 'var(--background)',
          borderRadius: 'var(--radius)',
          fontSize: '0.875rem'
        }}>
          <p style={{ fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Demo Credentials:
          </p>
          <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            <div><strong>Admin:</strong> admin@ea.com / admin</div>
            <div><strong>User:</strong> user@ea.com / user</div>
          </div>
          <div style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)',
            color: 'var(--text-tertiary)',
            fontSize: '0.8125rem'
          }}>
            SSO Integration: Ready for future implementation
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
