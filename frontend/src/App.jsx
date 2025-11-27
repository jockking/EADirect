import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom'
import { FiHome, FiPackage, FiFileText, FiAlertTriangle, FiSearch, FiUsers, FiLogOut, FiShoppingBag } from 'react-icons/fi'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Breadcrumb from './components/Breadcrumb'
import Login from './pages/Login'
import Home from './pages/Home'
import ADRList from './pages/ADRList'
import ADRDetail from './pages/ADRDetail'
import ADRForm from './pages/ADRForm'
import BusinessAppList from './pages/BusinessAppList'
import BusinessAppDetail from './pages/BusinessAppDetail'
import BusinessAppForm from './pages/BusinessAppForm'
import TechDebtList from './pages/TechDebtList'
import TechDebtDetail from './pages/TechDebtDetail'
import TechDebtForm from './pages/TechDebtForm'
import Search from './pages/Search'
import UserList from './pages/admin/UserList'
import UserForm from './pages/admin/UserForm'
import Profile from './pages/Profile'
import SupplierManagement from './pages/SupplierManagement'

function AppContent() {
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  // Render login page without layout
  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    )
  }

  // Render full layout for all other pages
  return (
    <div className="app-layout">
      {/* Top Header */}
      <header className="app-header">
        <div className="nav-logo">EA</div>
        <h1 className="app-header-title">EA Direct</h1>
        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginLeft: 'auto'
          }}>
            <Link to="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: user.profileImage ? 'transparent' : 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600',
                fontSize: '1rem',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
              >
                {user.profileImage ? (
                  <img src={`/api${user.profileImage}`} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user.name.split(' ').map(n => n[0]).join('').toUpperCase()
                )}
              </div>
              <span style={{
                color: 'white',
                fontSize: '0.9375rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span className="user-name">{user.name}</span>
                {isAdmin() && (
                  <span style={{
                    background: 'rgba(251, 191, 36, 0.9)',
                    color: '#78350f',
                    padding: '0.125rem 0.5rem',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.025em'
                  }}>
                    Admin
                  </span>
                )}
              </span>
            </Link>
            <button
              onClick={logout}
              className="button-secondary"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white'
              }}
            >
              <FiLogOut size={16} />
              <span className="logout-text">Logout</span>
            </button>
          </div>
        )}
      </header>

      {/* Sidebar Navigation */}
      <aside className="app-sidebar">
        <ul className="sidebar-links">
          <li>
            <NavLink to="/">
              <FiHome className="nav-icon" />
              <span className="nav-text">Home</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/business-apps">
              <FiPackage className="nav-icon" />
              <span className="nav-text">Business Apps</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/adrs">
              <FiFileText className="nav-icon" />
              <span className="nav-text">ADRs</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/tech-debt">
              <FiAlertTriangle className="nav-icon" />
              <span className="nav-text">Tech Debt</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/suppliers">
              <FiShoppingBag className="nav-icon" />
              <span className="nav-text">Suppliers</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/search">
              <FiSearch className="nav-icon" />
              <span className="nav-text">Search</span>
            </NavLink>
          </li>
          {user && isAdmin() && (
            <li>
              <NavLink to="/admin/users">
                <FiUsers className="nav-icon" />
                <span className="nav-text">Admin</span>
              </NavLink>
            </li>
          )}
        </ul>
      </aside>

      {/* Main Content Area */}
      <main className="app-main">
        <Breadcrumb />
        <div className="container">
          <Routes>
            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/adrs" element={<ProtectedRoute><ADRList /></ProtectedRoute>} />
            <Route path="/adrs/new" element={<ProtectedRoute><ADRForm /></ProtectedRoute>} />
            <Route path="/adrs/:id" element={<ProtectedRoute><ADRDetail /></ProtectedRoute>} />
            <Route path="/adrs/:id/edit" element={<ProtectedRoute><ADRForm /></ProtectedRoute>} />
            <Route path="/business-apps" element={<ProtectedRoute><BusinessAppList /></ProtectedRoute>} />
            <Route path="/business-apps/new" element={<ProtectedRoute><BusinessAppForm /></ProtectedRoute>} />
            <Route path="/business-apps/:id" element={<ProtectedRoute><BusinessAppDetail /></ProtectedRoute>} />
            <Route path="/business-apps/:id/edit" element={<ProtectedRoute><BusinessAppForm /></ProtectedRoute>} />
            <Route path="/tech-debt" element={<ProtectedRoute><TechDebtList /></ProtectedRoute>} />
            <Route path="/tech-debt/new" element={<ProtectedRoute><TechDebtForm /></ProtectedRoute>} />
            <Route path="/tech-debt/:id" element={<ProtectedRoute><TechDebtDetail /></ProtectedRoute>} />
            <Route path="/tech-debt/:id/edit" element={<ProtectedRoute><TechDebtForm /></ProtectedRoute>} />
            <Route path="/suppliers" element={<ProtectedRoute><SupplierManagement /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin/users" element={<ProtectedRoute requireAdmin={true}><UserList /></ProtectedRoute>} />
            <Route path="/admin/users/new" element={<ProtectedRoute requireAdmin={true}><UserForm /></ProtectedRoute>} />
            <Route path="/admin/users/:id/edit" element={<ProtectedRoute requireAdmin={true}><UserForm /></ProtectedRoute>} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
