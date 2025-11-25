import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { businessAppApi, productApi } from '../api'

function BusinessAppForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    architectural_owner: '',
    business_owner: '',
    product_owner: '',
    system_owner: '',
    status: 'active',
    resilience_category: '',
    geographic_locations: [],
    hosting_type: '',
    cloud_provider: '',
    development_type: '',
    technologies: [],
    dependencies: [],
    product_id: ''
  })
  const [products, setProducts] = useState([])
  const [geoInput, setGeoInput] = useState('')
  const [techInput, setTechInput] = useState('')
  const [depInput, setDepInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadProducts()
    if (isEdit) {
      loadApp()
    }
  }, [id])

  const loadProducts = async () => {
    try {
      const response = await productApi.list()
      setProducts(response.data)
    } catch (err) {
      console.error('Failed to load products', err)
    }
  }

  const loadApp = async () => {
    try {
      setLoading(true)
      const response = await businessAppApi.get(id)
      setFormData({
        ...response.data,
        geographic_locations: response.data.geographic_locations || [],
        technologies: response.data.technologies || [],
        dependencies: response.data.dependencies || [],
        resilience_category: response.data.resilience_category || '',
        hosting_type: response.data.hosting_type || '',
        development_type: response.data.development_type || ''
      })
    } catch (err) {
      setError('Failed to load application')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const addGeographicLocation = () => {
    if (geoInput.trim()) {
      setFormData(prev => ({
        ...prev,
        geographic_locations: [...prev.geographic_locations, geoInput.trim()]
      }))
      setGeoInput('')
    }
  }

  const removeGeographicLocation = (index) => {
    setFormData(prev => ({
      ...prev,
      geographic_locations: prev.geographic_locations.filter((_, i) => i !== index)
    }))
  }

  const addTechnology = () => {
    if (techInput.trim()) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()]
      }))
      setTechInput('')
    }
  }

  const removeTechnology = (index) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index)
    }))
  }

  const addDependency = () => {
    if (depInput.trim()) {
      setFormData(prev => ({
        ...prev,
        dependencies: [...prev.dependencies, depInput.trim()]
      }))
      setDepInput('')
    }
  }

  const removeDependency = (index) => {
    setFormData(prev => ({
      ...prev,
      dependencies: prev.dependencies.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const payload = {
        ...formData,
        resilience_category: formData.resilience_category || null,
        hosting_type: formData.hosting_type || null,
        development_type: formData.development_type || null
      }

      if (isEdit) {
        await businessAppApi.update(id, payload)
      } else {
        await businessAppApi.create(payload)
      }
      navigate('/business-apps')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save application')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEdit) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="card">
        <h2>{isEdit ? 'Edit Business Application' : 'New Business Application'}</h2>
      </div>

      {error && (
        <div className="error" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Basic Information</h3>

          <div className="form-group">
            <label>Application Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="active">Active</option>
              <option value="deprecated">Deprecated</option>
              <option value="planned">Planned</option>
              <option value="retired">Retired</option>
            </select>
          </div>
        </div>

        {/* Ownership Information */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Ownership</h3>

          <div className="form-group">
            <label>Architectural Owner *</label>
            <input
              type="text"
              name="architectural_owner"
              value={formData.architectural_owner}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Name of the architectural owner"
            />
          </div>

          <div className="form-group">
            <label>Business Owner</label>
            <input
              type="text"
              name="business_owner"
              value={formData.business_owner}
              onChange={handleChange}
              disabled={loading}
              placeholder="Name of the business owner"
            />
          </div>

          <div className="form-group">
            <label>Product Owner</label>
            <input
              type="text"
              name="product_owner"
              value={formData.product_owner}
              onChange={handleChange}
              disabled={loading}
              placeholder="Name of the product owner"
            />
          </div>

          <div className="form-group">
            <label>System Owner</label>
            <input
              type="text"
              name="system_owner"
              value={formData.system_owner}
              onChange={handleChange}
              disabled={loading}
              placeholder="Name of the system owner"
            />
          </div>
        </div>

        {/* Resilience & Geographic Information */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Resilience & Geography</h3>

          <div className="form-group">
            <label>Resilience Category</label>
            <select
              name="resilience_category"
              value={formData.resilience_category}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Select resilience category</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </select>
            <small style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
              Metal-based rating for application resilience
            </small>
          </div>

          <div className="form-group">
            <label>Geographic Locations</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={geoInput}
                onChange={(e) => setGeoInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGeographicLocation())}
                placeholder="Add location (e.g., North America, EMEA, APAC)"
                disabled={loading}
              />
              <button type="button" onClick={addGeographicLocation} className="button-secondary" disabled={loading}>
                Add
              </button>
            </div>
            <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {formData.geographic_locations.map((loc, index) => (
                <span key={index} className="badge" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {loc}
                  <button
                    type="button"
                    onClick={() => removeGeographicLocation(index)}
                    style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
                    disabled={loading}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Hosting & Deployment */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Hosting & Deployment</h3>

          <div className="form-group">
            <label>Hosting Type</label>
            <select
              name="hosting_type"
              value={formData.hosting_type}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Select hosting type</option>
              <option value="cloud">Cloud</option>
              <option value="on-premise">On-Premise</option>
              <option value="hybrid">Hybrid</option>
              <option value="managed-hosting">Managed Hosting</option>
            </select>
          </div>

          {formData.hosting_type === 'cloud' && (
            <div className="form-group">
              <label>Cloud Provider</label>
              <input
                type="text"
                name="cloud_provider"
                value={formData.cloud_provider}
                onChange={handleChange}
                disabled={loading}
                placeholder="e.g., AWS, Azure, GCP"
              />
            </div>
          )}

          <div className="form-group">
            <label>Development Type</label>
            <select
              name="development_type"
              value={formData.development_type}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Select development type</option>
              <option value="saas">SaaS (Software as a Service)</option>
              <option value="cots">COTS (Commercial Off-The-Shelf)</option>
              <option value="custom">Custom/Bespoke Development</option>
              <option value="open-source">Open Source</option>
              <option value="low-code">Low-Code/No-Code Platform</option>
              <option value="internal">Internally Developed</option>
            </select>
          </div>

          <div className="form-group">
            <label>Product/Software (Optional)</label>
            <select
              name="product_id"
              value={formData.product_id}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Select a product (optional)</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.supplier_name}
                </option>
              ))}
            </select>
            <small style={{ color: '#666', display: 'block', marginTop: '0.25rem' }}>
              Select the software product/vendor for this application
            </small>
          </div>
        </div>

        {/* Technical Information */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Technical Information</h3>

          <div className="form-group">
            <label>Technologies</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                placeholder="Add technology"
                disabled={loading}
              />
              <button type="button" onClick={addTechnology} className="button-secondary" disabled={loading}>
                Add
              </button>
            </div>
            <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {formData.technologies.map((tech, index) => (
                <span key={index} className="badge" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTechnology(index)}
                    style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
                    disabled={loading}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Dependencies</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={depInput}
                onChange={(e) => setDepInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDependency())}
                placeholder="Add dependency"
                disabled={loading}
              />
              <button type="button" onClick={addDependency} className="button-secondary" disabled={loading}>
                Add
              </button>
            </div>
            <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {formData.dependencies.map((dep, index) => (
                <span key={index} className="badge" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {dep}
                  <button
                    type="button"
                    onClick={() => removeDependency(index)}
                    style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
                    disabled={loading}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="button-group">
            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update Application' : 'Create Application')}
            </button>
            <button type="button" className="button-secondary" onClick={() => navigate('/business-apps')} disabled={loading}>
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default BusinessAppForm
