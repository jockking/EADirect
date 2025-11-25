import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="loading">
        Loading...
      </div>
    )
  }

  if (!user) {
    // Redirect to login while saving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && !isAdmin()) {
    // User is authenticated but not an admin
    return (
      <div className="container">
        <div className="card">
          <h2>Access Denied</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
            You don't have permission to access this page. Admin privileges are required.
          </p>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
