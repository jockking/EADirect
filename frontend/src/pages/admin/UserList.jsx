import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiPlus, FiEdit2, FiTrash2, FiShield, FiUser } from 'react-icons/fi'

function UserList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch users from API
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:8000/users')
        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }
        const data = await response.json()

        // Transform API response to match component format
        const transformedUsers = data.map(user => ({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          lastLogin: user.last_login,
          createdAt: new Date().toISOString() // API doesn't return this yet
        }))

        setUsers(transformedUsers)
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`http://localhost:8000/users/${userId}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          throw new Error('Failed to delete user')
        }

        // Remove user from local state
        setUsers(users.filter(u => u.id !== userId))
      } catch (error) {
        console.error('Error deleting user:', error)
        alert('Failed to delete user. Please try again.')
      }
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return <div className="loading">Loading users...</div>
  }

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>User Management ({users.length})</h2>
          <Link to="/admin/users/new">
            <button className="button">
              <FiPlus /> Add User
            </button>
          </Link>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Manage user accounts and permissions. SSO integration can be enabled in the future.
        </p>
      </div>

      {users.length === 0 ? (
        <div className="card">
          <p>No users found. Add your first user to get started!</p>
        </div>
      ) : (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ textAlign: 'left', padding: '1rem 0.75rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                    User
                  </th>
                  <th style={{ textAlign: 'left', padding: '1rem 0.75rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                    Role
                  </th>
                  <th style={{ textAlign: 'left', padding: '1rem 0.75rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                    Status
                  </th>
                  <th style={{ textAlign: 'left', padding: '1rem 0.75rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                    Last Login
                  </th>
                  <th style={{ textAlign: 'right', padding: '1rem 0.75rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'var(--primary-light)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--primary-color)',
                          fontWeight: '600'
                        }}>
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{user.name}</div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.375rem 0.75rem',
                        borderRadius: 'var(--radius)',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        background: user.role === 'admin' ? 'var(--warning-light)' : 'var(--secondary-light)',
                        color: user.role === 'admin' ? 'var(--warning-hover)' : 'var(--secondary-dark)'
                      }}>
                        {user.role === 'admin' ? <FiShield size={14} /> : <FiUser size={14} />}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <span className={`badge badge-${user.status}`}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {formatDate(user.lastLogin)}
                    </td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <Link to={`/admin/users/${user.id}/edit`}>
                          <button className="button-sm button">
                            <FiEdit2 size={14} /> Edit
                          </button>
                        </Link>
                        <button
                          className="button-sm button-danger"
                          onClick={() => handleDelete(user.id)}
                          disabled={user.id === 1} // Can't delete the primary admin
                        >
                          <FiTrash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserList
