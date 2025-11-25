import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { searchApi } from '../api'

function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setSearched(true)

    try {
      const response = await searchApi.search(query)
      setResults(response.data)
    } catch (err) {
      console.error('Search failed:', err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const getLink = (result) => {
    if (result.artifact_type === 'adr') {
      return `/adrs/${result.artifact_id}`
    } else if (result.artifact_type === 'business-app') {
      return `/business-apps/${result.artifact_id}`
    }
    return '#'
  }

  const getTypeBadge = (type) => {
    const typeLabels = {
      'adr': 'ADR',
      'business-app': 'Business App'
    }
    return typeLabels[type] || type
  }

  return (
    <div>
      <div className="card">
        <h2>Search Architecture Artifacts</h2>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            className="search-box"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for ADRs, business apps, technologies..."
          />
          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {searched && (
        <div className="card">
          {results.length === 0 ? (
            <p>No results found for "{query}"</p>
          ) : (
            <>
              <h3>Found {results.length} result{results.length !== 1 ? 's' : ''}</h3>
              {results.map((result, index) => (
                <Link key={index} to={getLink(result)} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="list-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h3>{result.title}</h3>
                        <p style={{ color: '#7f8c8d', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                          {result.snippet}
                        </p>
                      </div>
                      <span className="badge badge-active">
                        {getTypeBadge(result.artifact_type)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default Search
