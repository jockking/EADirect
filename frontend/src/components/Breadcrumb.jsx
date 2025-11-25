import React from 'react'
import { Link, useLocation } from 'react-router-dom'

function Breadcrumb() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  // Mapping for better breadcrumb names
  const nameMap = {
    'business-apps': 'Business Apps',
    'adrs': 'ADRs',
    'tech-debt': 'Tech Debt',
    'search': 'Search',
    'new': 'New',
    'edit': 'Edit'
  }

  if (pathnames.length === 0) {
    return null // Don't show breadcrumb on home page
  }

  return (
    <nav className="breadcrumb">
      <Link to="/">Home</Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
        const isLast = index === pathnames.length - 1
        const displayName = nameMap[name] || name

        return (
          <span key={routeTo}>
            <span className="breadcrumb-separator">/</span>
            {isLast ? (
              <span className="breadcrumb-current">{displayName}</span>
            ) : (
              <Link to={routeTo}>{displayName}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}

export default Breadcrumb
