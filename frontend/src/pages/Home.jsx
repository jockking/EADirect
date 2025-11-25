import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiPackage, FiFileText, FiAlertTriangle, FiShoppingBag, FiBox } from 'react-icons/fi'
import { dashboardApi } from '../api'

function Home() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const response = await dashboardApi.getStats()
      setStats(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading dashboard...</div>
  if (error) return <div className="error">{error}</div>

  const StatCard = ({ icon: Icon, title, value, link, color = '#3498db', items = null }) => (
    <div className="card" style={{ background: 'white', borderLeft: `4px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Icon size={24} style={{ color }} />
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#666' }}>{title}</h3>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2c3e50' }}>{value}</div>
          {items && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#666' }}>
              {Object.entries(items).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                  <span style={{ textTransform: 'capitalize' }}>{key}:</span>
                  <strong>{val}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
        {link && (
          <Link to={link}>
            <button className="button-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
              View All
            </button>
          </Link>
        )}
      </div>
    </div>
  )

  const RecentItem = ({ item, type }) => {
    const links = {
      app: `/business-apps/${item.id}`,
      adr: `/adrs/${item.id}`,
      debt: `/tech-debt/${item.id}`
    }

    return (
      <Link to={links[type]} style={{ textDecoration: 'none' }}>
        <div style={{
          padding: '0.75rem',
          background: '#f8f9fa',
          marginBottom: '0.5rem',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'background 0.2s',
          border: '1px solid #e9ecef'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = '#e9ecef'}
        onMouseOut={(e) => e.currentTarget.style.background = '#f8f9fa'}
        >
          <div style={{ fontWeight: '500', color: '#2c3e50', marginBottom: '0.25rem' }}>
            {item.name || item.title}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#666', display: 'flex', justifyContent: 'space-between' }}>
            <span>{new Date(item.created_at).toLocaleDateString()}</span>
            {item.priority && (
              <span style={{
                textTransform: 'capitalize',
                padding: '0.125rem 0.5rem',
                borderRadius: '12px',
                background: item.priority === 'critical' ? '#e74c3c' : item.priority === 'high' ? '#e67e22' : '#95a5a6',
                color: 'white',
                fontSize: '0.75rem'
              }}>
                {item.priority}
              </span>
            )}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Welcome to EA Direct</h2>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Your Enterprise Architecture Management Platform - Track applications, decisions, technical debt, and suppliers.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard
          icon={FiPackage}
          title="Business Applications"
          value={stats.totals.business_apps}
          link="/business-apps"
          color="#3498db"
          items={stats.business_apps_by_status}
        />
        <StatCard
          icon={FiFileText}
          title="Architecture Decisions"
          value={stats.totals.adrs}
          link="/adrs"
          color="#9b59b6"
          items={stats.adrs_by_status}
        />
        <StatCard
          icon={FiAlertTriangle}
          title="Technical Debt"
          value={stats.totals.tech_debt}
          link="/tech-debt"
          color="#e74c3c"
          items={stats.tech_debt_by_priority}
        />
        <StatCard
          icon={FiShoppingBag}
          title="Suppliers"
          value={stats.totals.suppliers}
          link="/suppliers"
          color="#16a085"
        />
        <StatCard
          icon={FiBox}
          title="Products"
          value={stats.totals.products}
          color="#27ae60"
        />
      </div>

      {/* Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {stats.recent_business_apps.length > 0 && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Recent Applications</h3>
              <Link to="/business-apps"><button className="button-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>View All</button></Link>
            </div>
            {stats.recent_business_apps.map(app => (
              <RecentItem key={app.id} item={app} type="app" />
            ))}
          </div>
        )}

        {stats.recent_adrs.length > 0 && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Recent ADRs</h3>
              <Link to="/adrs"><button className="button-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>View All</button></Link>
            </div>
            {stats.recent_adrs.map(adr => (
              <RecentItem key={adr.id} item={adr} type="adr" />
            ))}
          </div>
        )}

        {stats.recent_tech_debt.length > 0 && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Recent Tech Debt</h3>
              <Link to="/tech-debt"><button className="button-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>View All</button></Link>
            </div>
            {stats.recent_tech_debt.map(debt => (
              <RecentItem key={debt.id} item={debt} type="debt" />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
        <div className="button-group">
          <Link to="/business-apps/new">
            <button className="button">Add Application</button>
          </Link>
          <Link to="/adrs/new">
            <button className="button">Create ADR</button>
          </Link>
          <Link to="/tech-debt/new">
            <button className="button">Add Tech Debt</button>
          </Link>
          <Link to="/suppliers">
            <button className="button">Manage Suppliers</button>
          </Link>
          <Link to="/search">
            <button className="button-secondary">Search All</button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home
