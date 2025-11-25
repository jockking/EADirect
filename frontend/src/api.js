import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ADR API
export const adrApi = {
  list: () => api.get('/adrs'),
  get: (id) => api.get(`/adrs/${id}`),
  create: (data) => api.post('/adrs', data),
  update: (id, data) => api.put(`/adrs/${id}`, data),
  delete: (id) => api.delete(`/adrs/${id}`),
  getHistory: (id) => api.get(`/adrs/${id}/history`),
  getTechDebt: (id) => api.get(`/adrs/${id}/tech-debt`)
}

// Business App API
export const businessAppApi = {
  list: () => api.get('/business-apps'),
  get: (id) => api.get(`/business-apps/${id}`),
  create: (data) => api.post('/business-apps', data),
  update: (id, data) => api.put(`/business-apps/${id}`, data),
  delete: (id) => api.delete(`/business-apps/${id}`),
  getHistory: (id) => api.get(`/business-apps/${id}/history`)
}

// Tech Debt API
export const techDebtApi = {
  list: () => api.get('/tech-debt'),
  get: (id) => api.get(`/tech-debt/${id}`),
  create: (data) => api.post('/tech-debt', data),
  update: (id, data) => api.put(`/tech-debt/${id}`, data),
  delete: (id) => api.delete(`/tech-debt/${id}`),
  getHistory: (id) => api.get(`/tech-debt/${id}/history`)
}

// Search API
export const searchApi = {
  search: (query, type = null) => {
    const params = new URLSearchParams({ q: query })
    if (type) params.append('type', type)
    return api.get(`/search?${params.toString()}`)
  }
}

// Supplier API
export const supplierApi = {
  list: () => api.get('/suppliers'),
  get: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`)
}

// Product API
export const productApi = {
  list: () => api.get('/products'),
  listBySupplier: (supplierId) => api.get(`/suppliers/${supplierId}/products`),
  get: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`)
}

// Dashboard API
export const dashboardApi = {
  getStats: () => api.get('/dashboard')
}

export default api
