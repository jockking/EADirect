import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { techDebtApi } from '../api'

function TechDebtList() {
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadTechDebt()
  }, [])

  const loadTechDebt = async () => {
    try {
      setLoading(true)
      const response = await techDebtApi.list()
      setDebts(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load technical debt items')
      console.error(err)
    } finally {
      setLoading(false)
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

  const filteredDebts = debts.filter(debt => {
    if (filterPriority !== 'all' && debt.priority !== filterPriority) return false
    if (filterStatus !== 'all' && debt.status !== filterStatus) return false
    return true
  })

  if (loading) return <div className="loading">Loading technical debt...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Technical Debt</h2>
          <Link to="/tech-debt/new">
            <button className="button">Add Tech Debt</button>
          </Link>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="filter-priority">Filter by Priority</label>
            <select
              id="filter-priority"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="filter-status">Filter by Status</label>
            <select
              id="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="identified">Identified</option>
              <option value="accepted">Accepted</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="wont-fix">Won't Fix</option>
            </select>
          </div>
        </div>
      </div>

      {filteredDebts.length === 0 ? (
        <div className="card">
          <p>No technical debt items found. {filterPriority !== 'all' || filterStatus !== 'all' ? 'Try adjusting your filters.' : 'Add your first tech debt item to get started!'}</p>
        </div>
      ) : (
        <div className="card">
          {filteredDebts.map((debt) => (
            <Link key={debt.id} to={`/tech-debt/${debt.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="list-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3>{debt.title}</h3>
                    <p style={{ color: '#7f8c8d', marginTop: '0.5rem' }}>
                      {debt.description.substring(0, 200)}{debt.description.length > 200 ? '...' : ''}
                    </p>
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className={`badge ${getPriorityColor(debt.priority)}`}>
                        {debt.priority.toUpperCase()}
                      </span>
                      <span className={`badge ${getStatusColor(debt.status)}`}>
                        {debt.status}
                      </span>
                      {debt.owner && (
                        <span className="tag">Owner: {debt.owner}</span>
                      )}
                      {debt.target_resolution_date && (
                        <span className="tag">Target: {new Date(debt.target_resolution_date).toLocaleDateString()}</span>
                      )}
                      {debt.linked_adr_id && (
                        <span className="tag">Linked to ADR</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default TechDebtList
