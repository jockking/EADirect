import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { businessAppApi } from '../api'

function BusinessAppDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [app, setApp] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    loadApp()
  }, [id])

  const loadApp = async () => {
    try {
      setLoading(true)
      const response = await businessAppApi.get(id)
      setApp(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load business application')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async () => {
    try {
      const response = await businessAppApi.getHistory(id)
      setHistory(response.data)
      setShowHistory(true)
    } catch (err) {
      console.error('Failed to load history:', err)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this application?')) return

    try {
      await businessAppApi.delete(id)
      navigate('/business-apps')
    } catch (err) {
      alert('Failed to delete application')
      console.error(err)
    }
  }

  if (loading) return <div className="loading">Loading application...</div>
  if (error) return <div className="error">{error}</div>
  if (!app) return <div className="error">Application not found</div>

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h2>{app.name}</h2>
            <p style={{ color: '#7f8c8d', marginTop: '0.5rem' }}>{app.id}</p>
          </div>
          <span className={`badge badge-${app.status}`}>
            {app.status}
          </span>
        </div>

        <div className="button-group">
          <Link to={`/business-apps/${id}/edit`}>
            <button className="button">Edit</button>
          </Link>
          <button className="button-secondary" onClick={loadHistory}>
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
          <button className="button-danger" onClick={handleDelete}>Delete</button>
          <Link to="/business-apps">
            <button className="button-secondary">Back to List</button>
          </Link>
        </div>
      </div>

      {/* Basic Information */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Basic Information</h3>
        <div style={{ marginBottom: '1rem' }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Description</strong>
          <p style={{ marginTop: '0.25rem' }}>{app.description}</p>
        </div>
      </div>

      {/* Ownership Information */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Ownership</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <strong style={{ color: 'var(--text-secondary)' }}>Architectural Owner</strong>
            <p style={{ marginTop: '0.25rem' }}>{app.architectural_owner}</p>
          </div>
          {app.business_owner && (
            <div>
              <strong style={{ color: 'var(--text-secondary)' }}>Business Owner</strong>
              <p style={{ marginTop: '0.25rem' }}>{app.business_owner}</p>
            </div>
          )}
          {app.product_owner && (
            <div>
              <strong style={{ color: 'var(--text-secondary)' }}>Product Owner</strong>
              <p style={{ marginTop: '0.25rem' }}>{app.product_owner}</p>
            </div>
          )}
          {app.system_owner && (
            <div>
              <strong style={{ color: 'var(--text-secondary)' }}>System Owner</strong>
              <p style={{ marginTop: '0.25rem' }}>{app.system_owner}</p>
            </div>
          )}
        </div>
      </div>

      {/* Resilience & Geography */}
      {(app.resilience_category || (app.geographic_locations && app.geographic_locations.length > 0)) && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Resilience & Geography</h3>
          {app.resilience_category && (
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: 'var(--text-secondary)' }}>Resilience Category</strong>
              <p style={{ marginTop: '0.25rem', textTransform: 'capitalize' }}>{app.resilience_category}</p>
            </div>
          )}
          {app.geographic_locations && app.geographic_locations.length > 0 && (
            <div>
              <strong style={{ color: 'var(--text-secondary)' }}>Geographic Locations</strong>
              <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {app.geographic_locations.map((loc, index) => (
                  <span key={index} className="badge">{loc}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hosting & Deployment */}
      {(app.hosting_type || app.cloud_provider || app.development_type) && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Hosting & Deployment</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {app.hosting_type && (
              <div>
                <strong style={{ color: 'var(--text-secondary)' }}>Hosting Type</strong>
                <p style={{ marginTop: '0.25rem', textTransform: 'capitalize' }}>{app.hosting_type.replace('-', ' ')}</p>
              </div>
            )}
            {app.cloud_provider && (
              <div>
                <strong style={{ color: 'var(--text-secondary)' }}>Cloud Provider</strong>
                <p style={{ marginTop: '0.25rem' }}>{app.cloud_provider}</p>
              </div>
            )}
            {app.development_type && (
              <div>
                <strong style={{ color: 'var(--text-secondary)' }}>Development Type</strong>
                <p style={{ marginTop: '0.25rem', textTransform: 'uppercase' }}>
                  {app.development_type === 'saas' ? 'SaaS' :
                   app.development_type === 'cots' ? 'COTS' :
                   app.development_type.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Technical Information */}
      {((app.technologies && app.technologies.length > 0) || (app.dependencies && app.dependencies.length > 0)) && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Technical Information</h3>
          {app.technologies && app.technologies.length > 0 && (
            <div style={{ marginBottom: app.dependencies && app.dependencies.length > 0 ? '1rem' : '0' }}>
              <strong style={{ color: 'var(--text-secondary)' }}>Technologies</strong>
              <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {app.technologies.map((tech, index) => (
                  <span key={index} className="badge">{tech}</span>
                ))}
              </div>
            </div>
          )}
          {app.dependencies && app.dependencies.length > 0 && (
            <div>
              <strong style={{ color: 'var(--text-secondary)' }}>Dependencies</strong>
              <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {app.dependencies.map((dep, index) => (
                  <span key={index} className="badge">{dep}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showHistory && history.length > 0 && (
        <div className="card">
          <h3>Change History</h3>
          {history.map((entry, index) => (
            <div key={index} className="history-entry">
              <div className="author">{entry.author}</div>
              <div className="date">{new Date(entry.date).toLocaleString()}</div>
              <div className="message">{entry.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BusinessAppDetail
