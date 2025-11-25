import React, { useState, useEffect } from 'react'
import { supplierApi, productApi } from '../api'

function SupplierManagement() {
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [view, setView] = useState('list') // 'list', 'addSupplier', 'addProduct'
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [suppliersRes, productsRes] = await Promise.all([
        supplierApi.list(),
        productApi.list()
      ])
      setSuppliers(suppliersRes.data)
      setProducts(productsRes.data)
      setError(null)
    } catch (err) {
      setError('Failed to load data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitSupplier = async (e) => {
    e.preventDefault()
    try {
      await supplierApi.create(formData)
      setFormData({})
      setView('list')
      loadData()
    } catch (err) {
      setError('Failed to create supplier')
    }
  }

  const handleSubmitProduct = async (e) => {
    e.preventDefault()
    try {
      await productApi.create(formData)
      setFormData({})
      setView('list')
      loadData()
    } catch (err) {
      setError('Failed to create product')
    }
  }

  const handleDeleteSupplier = async (id) => {
    if (!window.confirm('Delete this supplier and all its products?')) return
    try {
      await supplierApi.delete(id)
      loadData()
    } catch (err) {
      setError('Failed to delete supplier')
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await productApi.delete(id)
      loadData()
    } catch (err) {
      setError('Failed to delete product')
    }
  }

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error">{error}</div>

  if (view === 'addSupplier') {
    return (
      <div className="card">
        <h2>Add New Supplier</h2>
        <form onSubmit={handleSubmitSupplier}>
          <div className="form-group">
            <label>Name *</label>
            <input required value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Website</label>
            <input value={formData.website || ''} onChange={(e) => setFormData({...formData, website: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Contact Email</label>
            <input type="email" value={formData.contact_email || ''} onChange={(e) => setFormData({...formData, contact_email: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Contact Phone</label>
            <input value={formData.contact_phone || ''} onChange={(e) => setFormData({...formData, contact_phone: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea value={formData.address || ''} onChange={(e) => setFormData({...formData, address: e.target.value})} />
          </div>
          <button type="submit" className="button">Create Supplier</button>
          <button type="button" className="button-secondary" onClick={() => {setView('list'); setFormData({})}}>Cancel</button>
        </form>
      </div>
    )
  }

  if (view === 'addProduct') {
    return (
      <div className="card">
        <h2>Add New Product</h2>
        <form onSubmit={handleSubmitProduct}>
          <div className="form-group">
            <label>Supplier *</label>
            <select required value={formData.supplier_id || ''} onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}>
              <option value="">Select a supplier</option>
              {suppliers.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
            </select>
          </div>
          <div className="form-group">
            <label>Product Name *</label>
            <input required value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Version</label>
            <input value={formData.version || ''} onChange={(e) => setFormData({...formData, version: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Product URL</label>
            <input value={formData.product_url || ''} onChange={(e) => setFormData({...formData, product_url: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Support URL</label>
            <input value={formData.support_url || ''} onChange={(e) => setFormData({...formData, support_url: e.target.value})} />
          </div>
          <div className="form-group">
            <label>License Type</label>
            <input value={formData.license_type || ''} onChange={(e) => setFormData({...formData, license_type: e.target.value})} placeholder="e.g., Commercial, Open Source" />
          </div>
          <button type="submit" className="button">Create Product</button>
          <button type="button" className="button-secondary" onClick={() => {setView('list'); setFormData({})}}>Cancel</button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2>Suppliers & Products</h2>
          <div>
            <button className="button" onClick={() => setView('addSupplier')}>Add Supplier</button>
            <button className="button" style={{marginLeft: '0.5rem'}} onClick={() => setView('addProduct')}>Add Product</button>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {suppliers.map(supplier => (
            <div key={supplier.id} className="card" style={{background: '#f8f9fa'}}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{flex: 1}}>
                  <h3>{supplier.name}</h3>
                  {supplier.description && <p>{supplier.description}</p>}
                  {supplier.website && <p><strong>Website:</strong> <a href={supplier.website} target="_blank" rel="noopener noreferrer">{supplier.website}</a></p>}
                  {supplier.contact_email && <p><strong>Email:</strong> {supplier.contact_email}</p>}

                  <h4 style={{marginTop: '1rem'}}>Products ({products.filter(p => p.supplier_id === supplier.id).length})</h4>
                  <ul style={{listStyle: 'none', padding: 0}}>
                    {products.filter(p => p.supplier_id === supplier.id).map(product => (
                      <li key={product.id} style={{padding: '0.5rem', background: 'white', marginBottom: '0.5rem', borderRadius: '4px', display: 'flex', justifyContent: 'space-between'}}>
                        <div>
                          <strong>{product.name}</strong> {product.version && `v${product.version}`}
                          {product.description && <div style={{fontSize: '0.9em', color: '#666'}}>{product.description}</div>}
                          {product.license_type && <div style={{fontSize: '0.85em', color: '#999'}}>License: {product.license_type}</div>}
                        </div>
                        <button className="button-danger" style={{alignSelf: 'center', padding: '0.25rem 0.5rem', fontSize: '0.9em'}} onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                      </li>
                    ))}
                  </ul>
                </div>
                <button className="button-danger" style={{alignSelf: 'start'}} onClick={() => handleDeleteSupplier(supplier.id)}>Delete Supplier</button>
              </div>
            </div>
          ))}
        </div>

        {suppliers.length === 0 && (
          <p>No suppliers found. Add your first supplier to get started!</p>
        )}
      </div>
    </div>
  )
}

export default SupplierManagement
