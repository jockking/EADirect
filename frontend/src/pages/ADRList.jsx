import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adrApi } from '../api'

function ADRList() {
  const [adrs, setAdrs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadADRs()
  }, [])

  const loadADRs = async () => {
    try {
      setLoading(true)
      const response = await adrApi.list()
      setAdrs(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load ADRs')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading ADRs...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Architecture Decision Records</h2>
          <Link to="/adrs/new">
            <button className="button">Create ADR</button>
          </Link>
        </div>
      </div>

      {adrs.length === 0 ? (
        <div className="card">
          <p>No ADRs found. Create your first ADR to get started!</p>
        </div>
      ) : (
        <div className="card">
          {adrs.map((adr) => (
            <Link key={adr.id} to={`/adrs/${adr.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="list-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3>{adr.title}</h3>
                    <p style={{ color: '#7f8c8d', marginTop: '0.5rem' }}>
                      {adr.id}
                    </p>
                  </div>
                  <span className={`badge badge-${adr.status}`}>
                    {adr.status}
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

export default ADRList
