import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'

function UserForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit) {
      // In production, fetch user data from API
      // Simulating data load
      setFormData({
        name: 'John Doe',
        email: 'john.doe@ea.com',
        password: '',
        role: 'user',
        status: 'active'
      })
    }
  }, [id, isEdit])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = isEdit
        ? `http://localhost:8000/users/${id}`
        : 'http://localhost:8000/users'

      const method = isEdit ? 'PUT' : 'POST'

      const payload = {
        email: formData.email,
        name: formData.name,
        role: formData.role,
        status: formData.status
      }

      // Only include password if it's provided (for create or update)
      if (formData.password) {
        payload.password = formData.password
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to save user')
      }

      navigate('/admin/users')
    } catch (err) {
      setError(err.message || 'Failed to save user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="card">
        <h2>{isEdit ? 'Edit User' : 'Add New User'}</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          {isEdit ? 'Update user information and permissions' : 'Create a new user account'}
        </p>
      </div>

      <div className="card">
        {error && (
          <div className="error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
              required
              disabled={loading}
            />
          </div>

          {!isEdit && (
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                disabled={loading}
              />
              <small style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                Minimum 8 characters recommended
              </small>
            </div>
          )}

          {isEdit && (
            <div style={{
              padding: '1rem',
              background: 'var(--secondary-light)',
              borderRadius: 'var(--radius)',
              marginBottom: '1.25rem'
            }}>
              <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Leave password field empty to keep the current password. To change password, use the "Reset Password" feature.
              </small>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="role">Role *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <small style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
              Admins have access to user management and all features
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div style={{
            marginTop: '2rem',
            padding: '1.25rem',
            background: 'var(--background)',
            borderRadius: 'var(--radius)',
            border: '1px dashed var(--border-color)'
          }}>
            <p style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
              Future SSO Integration
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6' }}>
              When SSO is enabled, users can authenticate through providers like Okta, Azure AD, or Google Workspace.
              Authentication method can be configured per organization.
            </p>
          </div>

          <div className="button-group" style={{ marginTop: '2rem' }}>
            <button
              type="submit"
              className="button"
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEdit ? 'Update User' : 'Create User')}
            </button>
            <Link to="/admin/users">
              <button type="button" className="button-secondary" disabled={loading}>
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserForm
