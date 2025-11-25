import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { adrApi } from '../api'

function ADRDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [adr, setAdr] = useState(null)
  const [techDebt, setTechDebt] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    loadADR()
    loadTechDebt()
  }, [id])

  const loadADR = async () => {
    try {
      setLoading(true)
      const response = await adrApi.get(id)
      setAdr(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load ADR')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadTechDebt = async () => {
    try {
      const response = await adrApi.getTechDebt(id)
      setTechDebt(response.data)
    } catch (err) {
      console.error('Failed to load tech debt:', err)
    }
  }

  const loadHistory = async () => {
    try {
      const response = await adrApi.getHistory(id)
      setHistory(response.data)
      setShowHistory(true)
    } catch (err) {
      console.error('Failed to load history:', err)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this ADR?')) return

    try {
      await adrApi.delete(id)
      navigate('/adrs')
    } catch (err) {
      alert('Failed to delete ADR')
      console.error(err)
    }
  }

  const getPriorityColor = (priority) => {
    const colors = {
      'critical': 'badge-danger',
      'high': 'badge-warning',
      'medium': 'badge-active',
      'low': 'badge-deprecated'
    }
    return colors[priority] || 'badge-deprecated'
  }

  if (loading) return <div className="loading">Loading ADR...</div>
  if (error) return <div className="error">{error}</div>
  if (!adr) return <div className="error">ADR not found</div>

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h2>{adr.title}</h2>
            <p style={{ color: '#7f8c8d', marginTop: '0.5rem' }}>{id}</p>
            {adr.stakeholders && adr.stakeholders.length > 0 && (
              <div style={{ marginTop: '0.75rem' }}>
                <strong style={{ fontSize: '0.875rem' }}>Stakeholders: </strong>
                {adr.stakeholders.map((stakeholder, index) => (
                  <span key={index} className="tag">{stakeholder}</span>
                ))}
              </div>
            )}
            {adr.related_adrs && adr.related_adrs.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong style={{ fontSize: '0.875rem' }}>Related ADRs: </strong>
                {adr.related_adrs.map((relatedAdr, index) => (
                  <Link key={index} to={`/adrs/${relatedAdr}`}>
                    <span className="tag" style={{ cursor: 'pointer', background: '#dbeafe', color: '#1e40af' }}>
                      {relatedAdr}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <span className={`badge badge-${adr.status}`}>
            {adr.status}
          </span>
        </div>

        <div className="button-group">
          <Link to={`/adrs/${id}/edit`}>
            <button className="button">Edit</button>
          </Link>
          <Link to={`/tech-debt/new?adr=${id}`}>
            <button className="button-success">Add Tech Debt</button>
          </Link>
          <button className="button-secondary" onClick={loadHistory}>
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
          <button className="button-danger" onClick={handleDelete}>Delete</button>
          <Link to="/adrs">
            <button className="button-secondary">Back to List</button>
          </Link>
        </div>
      </div>

      {techDebt.length > 0 && (
        <div className="card" style={{ background: '#fef3c7', borderColor: '#fbbf24' }}>
          <h3>⚠️ Linked Technical Debt ({techDebt.length})</h3>
          {techDebt.map((debt) => (
            <Link key={debt.id} to={`/tech-debt/${debt.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'white',
                padding: '1rem',
                borderRadius: '6px',
                marginTop: '0.75rem',
                border: '1px solid #fbbf24'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#92400e' }}>{debt.title}</h4>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#78350f', fontSize: '0.875rem' }}>
                      {debt.description.substring(0, 150)}{debt.description.length > 150 ? '...' : ''}
                    </p>
                  </div>
                  <span className={`badge ${getPriorityColor(debt.priority)}`}>
                    {debt.priority.toUpperCase()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="card">
        <h3>Context</h3>
        <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem', lineHeight: '1.6' }}>{adr.context}</p>
      </div>

      {adr.options && adr.options.length > 0 && (
        <div className="card">
          <h3>Options Considered</h3>
          {adr.options.map((option, index) => (
            <div key={index} style={{
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1.25rem',
              marginTop: index === 0 ? '1rem' : '0.75rem',
              background: '#f8fafc'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Option {index + 1}: {option.name}</h4>
              <p style={{ margin: '0.5rem 0', color: '#475569' }}>{option.description}</p>

              {option.pros && option.pros.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <strong style={{ color: '#16a34a' }}>Pros:</strong>
                  <ul style={{ marginLeft: '1.5rem', marginTop: '0.25rem' }}>
                    {option.pros.map((pro, i) => (
                      <li key={i} style={{ color: '#15803d' }}>{pro}</li>
                    ))}
                  </ul>
                </div>
              )}

              {option.cons && option.cons.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <strong style={{ color: '#dc2626' }}>Cons:</strong>
                  <ul style={{ marginLeft: '1.5rem', marginTop: '0.25rem' }}>
                    {option.cons.map((con, i) => (
                      <li key={i} style={{ color: '#b91c1c' }}>{con}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.75rem' }}>
                {option.cost_estimate && (
                  <div>
                    <strong>Cost Estimate:</strong> {option.cost_estimate}
                  </div>
                )}
                {option.effort_estimate && (
                  <div>
                    <strong>Effort Estimate:</strong> {option.effort_estimate}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {adr.recommended_option && (
        <div className="card" style={{ background: '#f0f9ff', borderColor: '#3b82f6' }}>
          <h3>💡 Recommended Option</h3>
          <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem', lineHeight: '1.6' }}>{adr.recommended_option}</p>
        </div>
      )}

      {adr.strategic_selection && (
        <div className="card" style={{ background: '#f0fdf4', borderColor: '#16a34a' }}>
          <h3>🎯 Strategic Selection (Long-term)</h3>
          <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem', lineHeight: '1.6' }}>{adr.strategic_selection}</p>
        </div>
      )}

      {adr.interim_selection && (
        <div className="card" style={{ background: '#fef3c7', borderColor: '#f59e0b' }}>
          <h3>⏱️ Interim Selection (Short-term)</h3>
          <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem', lineHeight: '1.6' }}>{adr.interim_selection}</p>
          {adr.strategic_selection && adr.interim_selection !== adr.strategic_selection && (
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'white', borderRadius: '6px', border: '1px solid #f59e0b' }}>
              <strong style={{ color: '#92400e' }}>Note:</strong> This interim selection differs from the strategic selection.
              Check the linked technical debt above for migration planning.
            </div>
          )}
        </div>
      )}

      {adr.decision_rationale && (
        <div className="card">
          <h3>Decision Rationale</h3>
          <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem', lineHeight: '1.6' }}>{adr.decision_rationale}</p>
        </div>
      )}

      <div className="card">
        <h3>Consequences</h3>
        <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem', lineHeight: '1.6' }}>{adr.consequences}</p>
      </div>

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

export default ADRDetail
