import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { techDebtApi, adrApi } from '../api'

function TechDebtForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    linked_adr_id: searchParams.get('adr') || '',
    owner: '',
    priority: 'medium',
    status: 'identified',
    impact: '',
    effort_estimate: '',
    target_resolution_date: '',
    actual_resolution_date: '',
    affected_systems: [],
    tags: []
  })

  const [systemInput, setSystemInput] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [adrs, setAdrs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAdrs()
    if (isEdit) {
      loadTechDebt()
    }
  }, [id])

  const loadAdrs = async () => {
    try {
      const response = await adrApi.list()
      setAdrs(response.data)
    } catch (err) {
      console.error('Failed to load ADRs:', err)
    }
  }

  const loadTechDebt = async () => {
    try {
      setLoading(true)
      const response = await techDebtApi.get(id)
      const data = response.data
      setFormData({
        ...data,
        target_resolution_date: data.target_resolution_date || '',
        actual_resolution_date: data.actual_resolution_date || '',
        affected_systems: data.affected_systems || [],
        tags: data.tags || []
      })
    } catch (err) {
      setError('Failed to load tech debt item')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const addSystem = () => {
    if (systemInput.trim()) {
      setFormData(prev => ({
        ...prev,
        affected_systems: [...prev.affected_systems, systemInput.trim()]
      }))
      setSystemInput('')
    }
  }

  const removeSystem = (index) => {
    setFormData(prev => ({
      ...prev,
      affected_systems: prev.affected_systems.filter((_, i) => i !== index)
    }))
  }

  const addTag = () => {
    if (tagInput.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Prepare data
    const submitData = {
      ...formData,
      linked_adr_id: formData.linked_adr_id || null,
      target_resolution_date: formData.target_resolution_date || null,
      actual_resolution_date: formData.actual_resolution_date || null
    }

    try {
      if (isEdit) {
        await techDebtApi.update(id, submitData)
        navigate(`/tech-debt/${id}`)
      } else {
        const response = await techDebtApi.create(submitData)
        navigate(`/tech-debt/${response.data.id}`)
      }
    } catch (err) {
      setError('Failed to save tech debt item')
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="card">
        <h2>{isEdit ? 'Edit Tech Debt Item' : 'Add New Tech Debt Item'}</h2>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Migrate authentication to OAuth 2.0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe the technical debt in detail..."
              style={{ minHeight: '120px' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="linked_adr_id">Linked ADR (Optional)</label>
            <select
              id="linked_adr_id"
              name="linked_adr_id"
              value={formData.linked_adr_id}
              onChange={handleChange}
            >
              <option value="">No linked ADR</option>
              {adrs.map((adr) => (
                <option key={adr.id} value={adr.id}>
                  {adr.title} ({adr.id})
                </option>
              ))}
            </select>
            <small style={{ color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
              Link this tech debt to an ADR if it was created as a consequence of an architectural decision
            </small>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="priority">Priority *</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="identified">Identified</option>
                <option value="accepted">Accepted</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="wont-fix">Won't Fix</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="owner">Owner *</label>
            <input
              type="text"
              id="owner"
              name="owner"
              value={formData.owner}
              onChange={handleChange}
              required
              placeholder="e.g., Platform Team, John Doe"
            />
          </div>

          <div className="form-group">
            <label htmlFor="impact">Impact</label>
            <textarea
              id="impact"
              name="impact"
              value={formData.impact}
              onChange={handleChange}
              placeholder="Describe the impact of this technical debt..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="effort_estimate">Effort Estimate</label>
            <input
              type="text"
              id="effort_estimate"
              name="effort_estimate"
              value={formData.effort_estimate}
              onChange={handleChange}
              placeholder="e.g., 2 person-weeks, 40 hours, High"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="target_resolution_date">Target Resolution Date</label>
              <input
                type="date"
                id="target_resolution_date"
                name="target_resolution_date"
                value={formData.target_resolution_date}
                onChange={handleChange}
              />
            </div>

            {formData.status === 'resolved' && (
              <div className="form-group">
                <label htmlFor="actual_resolution_date">Actual Resolution Date</label>
                <input
                  type="date"
                  id="actual_resolution_date"
                  name="actual_resolution_date"
                  value={formData.actual_resolution_date}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Affected Systems</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                value={systemInput}
                onChange={(e) => setSystemInput(e.target.value)}
                placeholder="e.g., Auth Service, Payment API"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSystem())}
              />
              <button type="button" className="button" onClick={addSystem}>Add</button>
            </div>
            <div>
              {formData.affected_systems.map((system, index) => (
                <span key={index} className="tag" style={{ cursor: 'pointer' }} onClick={() => removeSystem(index)}>
                  {system} ✕
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Tags</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="e.g., security, performance, scalability"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button type="button" className="button" onClick={addTag}>Add</button>
            </div>
            <div>
              {formData.tags.map((tag, index) => (
                <span key={index} className="tag" style={{ cursor: 'pointer' }} onClick={() => removeTag(index)}>
                  {tag} ✕
                </span>
              ))}
            </div>
          </div>

          <div className="button-group">
            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update Tech Debt' : 'Create Tech Debt')}
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={() => navigate(isEdit ? `/tech-debt/${id}` : '/tech-debt')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TechDebtForm
