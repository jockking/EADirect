import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adrApi } from '../api'

function ADRForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    title: '',
    context: '',
    options: [],
    recommended_option: '',
    strategic_selection: '',
    interim_selection: '',
    decision_rationale: '',
    consequences: '',
    stakeholders: [],
    related_adrs: [],
    status: 'proposed'
  })

  const [stakeholderInput, setStakeholderInput] = useState('')
  const [relatedAdrInput, setRelatedAdrInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isEdit) {
      loadADR()
    }
  }, [id])

  const loadADR = async () => {
    try {
      setLoading(true)
      const response = await adrApi.get(id)
      setFormData(response.data)
    } catch (err) {
      setError('Failed to load ADR')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, {
        name: '',
        description: '',
        pros: [],
        cons: [],
        cost_estimate: '',
        effort_estimate: ''
      }]
    }))
  }

  const removeOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
  }

  const updateOption = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === index ? { ...opt, [field]: value } : opt
      )
    }))
  }

  const addProCon = (optionIndex, type, value) => {
    if (!value.trim()) return

    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => {
        if (i === optionIndex) {
          return {
            ...opt,
            [type]: [...opt[type], value.trim()]
          }
        }
        return opt
      })
    }))
  }

  const removeProCon = (optionIndex, type, proConIndex) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => {
        if (i === optionIndex) {
          return {
            ...opt,
            [type]: opt[type].filter((_, j) => j !== proConIndex)
          }
        }
        return opt
      })
    }))
  }

  const addStakeholder = () => {
    if (stakeholderInput.trim()) {
      setFormData(prev => ({
        ...prev,
        stakeholders: [...prev.stakeholders, stakeholderInput.trim()]
      }))
      setStakeholderInput('')
    }
  }

  const removeStakeholder = (index) => {
    setFormData(prev => ({
      ...prev,
      stakeholders: prev.stakeholders.filter((_, i) => i !== index)
    }))
  }

  const addRelatedAdr = () => {
    if (relatedAdrInput.trim()) {
      setFormData(prev => ({
        ...prev,
        related_adrs: [...prev.related_adrs, relatedAdrInput.trim()]
      }))
      setRelatedAdrInput('')
    }
  }

  const removeRelatedAdr = (index) => {
    setFormData(prev => ({
      ...prev,
      related_adrs: prev.related_adrs.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isEdit) {
        await adrApi.update(id, formData)
        navigate(`/adrs/${id}`)
      } else {
        const response = await adrApi.create(formData)
        navigate(`/adrs/${response.data.id}`)
      }
    } catch (err) {
      setError('Failed to save ADR')
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="card">
        <h2>{isEdit ? 'Edit ADR' : 'Create New ADR'}</h2>

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
              placeholder="e.g., Use PostgreSQL for data persistence"
            />
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
              <option value="proposed">Proposed</option>
              <option value="accepted">Accepted</option>
              <option value="deprecated">Deprecated</option>
              <option value="superseded">Superseded</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="context">Context *</label>
            <textarea
              id="context"
              name="context"
              value={formData.context}
              onChange={handleChange}
              required
              placeholder="Describe the context and problem that led to this decision..."
              style={{ minHeight: '120px' }}
            />
          </div>

          <div className="form-group">
            <label>Stakeholders</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                value={stakeholderInput}
                onChange={(e) => setStakeholderInput(e.target.value)}
                placeholder="e.g., Engineering Team, Product Owner"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStakeholder())}
              />
              <button type="button" className="button-sm button" onClick={addStakeholder}>Add</button>
            </div>
            <div>
              {formData.stakeholders.map((stakeholder, index) => (
                <span key={index} className="tag" style={{ cursor: 'pointer' }} onClick={() => removeStakeholder(index)}>
                  {stakeholder} ✕
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Related ADRs</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                value={relatedAdrInput}
                onChange={(e) => setRelatedAdrInput(e.target.value)}
                placeholder="e.g., 20251115-microservices-architecture"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRelatedAdr())}
              />
              <button type="button" className="button-sm button" onClick={addRelatedAdr}>Add</button>
            </div>
            <div>
              {formData.related_adrs.map((adr, index) => (
                <span key={index} className="tag" style={{ cursor: 'pointer' }} onClick={() => removeRelatedAdr(index)}>
                  {adr} ✕
                </span>
              ))}
            </div>
          </div>

          <hr style={{ margin: '2rem 0', border: 'none', borderTop: '2px solid #e2e8f0' }} />

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Decision Options</h3>
              <button type="button" className="button-success button-sm" onClick={addOption}>
                + Add Option
              </button>
            </div>

            {formData.options.map((option, optIndex) => (
              <OptionEditor
                key={optIndex}
                option={option}
                optionIndex={optIndex}
                updateOption={updateOption}
                removeOption={removeOption}
                addProCon={addProCon}
                removeProCon={removeProCon}
              />
            ))}
          </div>

          <div className="form-group">
            <label htmlFor="recommended_option">Recommended Option</label>
            <textarea
              id="recommended_option"
              name="recommended_option"
              value={formData.recommended_option}
              onChange={handleChange}
              placeholder="State which option is recommended and why..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="strategic_selection">Strategic Selection (Long-term)</label>
            <textarea
              id="strategic_selection"
              name="strategic_selection"
              value={formData.strategic_selection}
              onChange={handleChange}
              placeholder="Describe the long-term strategic solution..."
            />
            <small style={{ color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
              This is the ideal long-term solution you want to implement
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="interim_selection">Interim Selection (Short-term)</label>
            <textarea
              id="interim_selection"
              name="interim_selection"
              value={formData.interim_selection}
              onChange={handleChange}
              placeholder="Describe any temporary or short-term solution..."
            />
            <small style={{ color: '#f59e0b', marginTop: '0.25rem', display: 'block', fontWeight: '500' }}>
              ⚠️ If this differs from the strategic selection, tech debt will be automatically created
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="decision_rationale">Decision Rationale</label>
            <textarea
              id="decision_rationale"
              name="decision_rationale"
              value={formData.decision_rationale}
              onChange={handleChange}
              placeholder="Explain why this decision was made..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="consequences">Consequences *</label>
            <textarea
              id="consequences"
              name="consequences"
              value={formData.consequences}
              onChange={handleChange}
              required
              placeholder="Describe the consequences of this decision..."
            />
          </div>

          <div className="button-group">
            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update ADR' : 'Create ADR')}
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={() => navigate(isEdit ? `/adrs/${id}` : '/adrs')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Separate component for option editing
function OptionEditor({ option, optionIndex, updateOption, removeOption, addProCon, removeProCon }) {
  const [proInput, setProInput] = useState('')
  const [conInput, setConInput] = useState('')

  const handleAddPro = () => {
    addProCon(optionIndex, 'pros', proInput)
    setProInput('')
  }

  const handleAddCon = () => {
    addProCon(optionIndex, 'cons', conInput)
    setConInput('')
  }

  return (
    <div style={{
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '1rem',
      background: '#f8fafc'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0 }}>Option {optionIndex + 1}</h4>
        <button
          type="button"
          className="button-danger button-sm"
          onClick={() => removeOption(optionIndex)}
        >
          Remove Option
        </button>
      </div>

      <div className="form-group">
        <label>Option Name *</label>
        <input
          type="text"
          value={option.name}
          onChange={(e) => updateOption(optionIndex, 'name', e.target.value)}
          placeholder="e.g., PostgreSQL"
          required
        />
      </div>

      <div className="form-group">
        <label>Description *</label>
        <textarea
          value={option.description}
          onChange={(e) => updateOption(optionIndex, 'description', e.target.value)}
          placeholder="Describe this option..."
          required
        />
      </div>

      <div className="form-group">
        <label>Pros</label>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input
            type="text"
            value={proInput}
            onChange={(e) => setProInput(e.target.value)}
            placeholder="Add a pro..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPro())}
          />
          <button type="button" className="button-success button-sm" onClick={handleAddPro}>Add</button>
        </div>
        <ul style={{ marginLeft: '1.5rem' }}>
          {option.pros.map((pro, i) => (
            <li key={i} style={{ marginBottom: '0.5rem' }}>
              {pro}{' '}
              <button
                type="button"
                onClick={() => removeProCon(optionIndex, 'pros', i)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="form-group">
        <label>Cons</label>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input
            type="text"
            value={conInput}
            onChange={(e) => setConInput(e.target.value)}
            placeholder="Add a con..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCon())}
          />
          <button type="button" className="button-warning button-sm" onClick={handleAddCon}>Add</button>
        </div>
        <ul style={{ marginLeft: '1.5rem' }}>
          {option.cons.map((con, i) => (
            <li key={i} style={{ marginBottom: '0.5rem' }}>
              {con}{' '}
              <button
                type="button"
                onClick={() => removeProCon(optionIndex, 'cons', i)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label>Cost Estimate</label>
          <input
            type="text"
            value={option.cost_estimate}
            onChange={(e) => updateOption(optionIndex, 'cost_estimate', e.target.value)}
            placeholder="e.g., $50k, 3 months"
          />
        </div>

        <div className="form-group">
          <label>Effort Estimate</label>
          <input
            type="text"
            value={option.effort_estimate}
            onChange={(e) => updateOption(optionIndex, 'effort_estimate', e.target.value)}
            placeholder="e.g., 2 person-months"
          />
        </div>
      </div>
    </div>
  )
}

export default ADRForm
