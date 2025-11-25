import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { techDebtApi, adrApi } from '../api'

function TechDebtDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [debt, setDebt] = useState(null)
  const [linkedAdr, setLinkedAdr] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    loadTechDebt()
  }, [id])

  const loadTechDebt = async () => {
    try {
      setLoading(true)
      const response = await techDebtApi.get(id)
      setDebt(response.data)

      // Load linked ADR if exists
      if (response.data.linked_adr_id) {
        try {
          const adrResponse = await adrApi.get(response.data.linked_adr_id)
          setLinkedAdr(adrResponse.data)
        } catch (err) {
          console.error('Failed to load linked ADR:', err)
        }
      }

      setError(null)
    } catch (err) {
      setError('Failed to load tech debt item')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async () => {
    try {
      const response = await techDebtApi.getHistory(id)
      setHistory(response.data)
      setShowHistory(true)
    } catch (err) {
      console.error('Failed to load history:', err)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this tech debt item?')) return

    try {
      await techDebtApi.delete(id)
      navigate('/tech-debt')
    } catch (err) {
      alert('Failed to delete tech debt item')
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

  const getStatusColor = (status) => {
    const colors = {
      'identified': 'badge-deprecated',
      'accepted': 'badge-proposed',
      'in-progress': 'badge-active',
      'resolved': 'badge-accepted',
      'wont-fix': 'badge-deprecated'
    }
    return colors[status] || 'badge-deprecated'
  }

  if (loading) return <div className="loading">Loading tech debt...</div>
  if (error) return <div className="error">{error}</div>
  if (!debt) return <div className="error">Tech debt not found</div>

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <h2>{debt.title}</h2>
            <p style={{ color: '#7f8c8d', marginTop: '0.5rem' }}>{id}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className={`badge ${getPriorityColor(debt.priority)}`}>
              {debt.priority.toUpperCase()}
            </span>
            <span className={`badge ${getStatusColor(debt.status)}`}>
              {debt.status}
            </span>
          </div>
        </div>

        <div className="button-group">
          <Link to={`/tech-debt/${id}/edit`}>
            <button className="button">Edit</button>
          </Link>
          <button className="button-secondary" onClick={loadHistory}>
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
          <button className="button-danger" onClick={handleDelete}>Delete</button>
          <Link to="/tech-debt">
            <button className="button-secondary">Back to List</button>
          </Link>
        </div>
      </div>

      {linkedAdr && (
        <div className="card" style={{ background: '#f0f9ff', borderColor: '#bfdbfe' }}>
          <h3>Linked ADR</h3>
          <Link to={`/adrs/${linkedAdr.id}`} style={{ textDecoration: 'none' }}>
            <div style={{ padding: '0.75rem', background: 'white', borderRadius: '6px', marginTop: '0.5rem' }}>
              <h4 style={{ color: '#2563eb', margin: 0 }}>{linkedAdr.title}</h4>
              <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>{linkedAdr.id}</p>
            </div>
          </Link>
        </div>
      )}

      <div className="card">
        <h3>Description</h3>
        <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>{debt.description}</p>
      </div>

      <div className="card">
        <h3>Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
          <div>
            <strong>Owner:</strong>
            <p style={{ marginTop: '0.25rem' }}>{debt.owner}</p>
          </div>
          {debt.effort_estimate && (
            <div>
              <strong>Effort Estimate:</strong>
              <p style={{ marginTop: '0.25rem' }}>{debt.effort_estimate}</p>
            </div>
          )}
          {debt.created_date && (
            <div>
              <strong>Created Date:</strong>
              <p style={{ marginTop: '0.25rem' }}>{new Date(debt.created_date).toLocaleDateString()}</p>
            </div>
          )}
          {debt.target_resolution_date && (
            <div>
              <strong>Target Resolution:</strong>
              <p style={{ marginTop: '0.25rem' }}>{new Date(debt.target_resolution_date).toLocaleDateString()}</p>
            </div>
          )}
          {debt.actual_resolution_date && (
            <div>
              <strong>Actual Resolution:</strong>
              <p style={{ marginTop: '0.25rem' }}>{new Date(debt.actual_resolution_date).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>

      {debt.impact && (
        <div className="card">
          <h3>Impact</h3>
          <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>{debt.impact}</p>
        </div>
      )}

      {debt.affected_systems && debt.affected_systems.length > 0 && (
        <div className="card">
          <h3>Affected Systems</h3>
          <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
            {debt.affected_systems.map((system, index) => (
              <li key={index}>{system}</li>
            ))}
          </ul>
        </div>
      )}

      {debt.tags && debt.tags.length > 0 && (
        <div className="card">
          <h3>Tags</h3>
          <div style={{ marginTop: '0.5rem' }}>
            {debt.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
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

export default TechDebtDetail
