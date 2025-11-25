import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { businessAppApi } from '../api'

function BusinessAppList() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadApps()
  }, [])

  const loadApps = async () => {
    try {
      setLoading(true)
      const response = await businessAppApi.list()
      setApps(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load business applications')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Filter applications by status
  const filteredApps = statusFilter === 'all'
    ? apps
    : apps.filter(app => app.status === statusFilter)

  // Get unique statuses from the apps
  const statuses = ['all', ...new Set(apps.map(app => app.status))]

  if (loading) return <div className="loading">Loading business applications...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Business Applications ({filteredApps.length})</h2>
          <Link to="/business-apps/new">
            <button className="button">Add Application</button>
          </Link>
        </div>

        {/* Status Filter */}
        {statuses.length > 1 && (
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#2c3e50' }}>
              Filter by Status:
            </label>
            <div className="button-group">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={statusFilter === status ? 'button' : 'button-secondary'}
                  style={{ textTransform: 'capitalize' }}
                >
                  {status === 'all' ? 'All' : status}
                  {status !== 'all' && ` (${apps.filter(app => app.status === status).length})`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {filteredApps.length === 0 ? (
        <div className="card">
          <p>
            {apps.length === 0
              ? 'No business applications found. Add your first application to get started!'
              : `No applications with status "${statusFilter}".`
            }
          </p>
        </div>
      ) : (
        <div className="card">
          {filteredApps.map((app) => (
            <Link key={app.id} to={`/business-apps/${app.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="list-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0 }}>{app.name}</h3>
                      {app.resilience_category && (
                        <span
                          className="badge"
                          style={{
                            fontSize: '0.75rem',
                            textTransform: 'capitalize'
                          }}
                        >
                          {app.resilience_category}
                        </span>
                      )}
                    </div>
                    <p style={{ color: '#7f8c8d', marginTop: '0.5rem' }}>
                      {app.description}
                    </p>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                      <p style={{ color: '#95a5a6', margin: '0.25rem 0' }}>
                        Architectural Owner: {app.architectural_owner}
                      </p>
                      {(app.hosting_type || app.development_type) && (
                        <p style={{ color: '#95a5a6', margin: '0.25rem 0' }}>
                          {app.hosting_type && (
                            <span style={{ textTransform: 'capitalize' }}>
                              {app.hosting_type.replace('-', ' ')}
                              {app.cloud_provider && ` (${app.cloud_provider})`}
                            </span>
                          )}
                          {app.hosting_type && app.development_type && ' • '}
                          {app.development_type && (
                            <span style={{ textTransform: 'uppercase' }}>
                              {app.development_type === 'saas' ? 'SaaS' :
                               app.development_type === 'cots' ? 'COTS' :
                               app.development_type.replace('-', ' ')}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    {((app.geographic_locations && app.geographic_locations.length > 0) || (app.technologies && app.technologies.length > 0)) && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {app.geographic_locations && app.geographic_locations.length > 0 && (
                          <>
                            {app.geographic_locations.slice(0, 3).map((loc, index) => (
                              <span key={`geo-${index}`} className="badge" style={{ fontSize: '0.75rem', backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
                                {loc}
                              </span>
                            ))}
                            {app.geographic_locations.length > 3 && (
                              <span className="badge" style={{ fontSize: '0.75rem', backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
                                +{app.geographic_locations.length - 3} more
                              </span>
                            )}
                          </>
                        )}
                        {app.technologies && app.technologies.length > 0 && (
                          <>
                            {app.technologies.slice(0, 3).map((tech, index) => (
                              <span key={`tech-${index}`} className="tag">{tech}</span>
                            ))}
                            {app.technologies.length > 3 && (
                              <span className="tag">+{app.technologies.length - 3} more</span>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <span className={`badge badge-${app.status}`}>
                    {app.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default BusinessAppList
