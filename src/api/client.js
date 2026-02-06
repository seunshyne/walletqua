/**
 * HTTP Client - Core API communication layer
 * Handles all HTTP requests with automatic token injection and error handling
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://primewallet.duckdns.org'

class APIClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }

  /**
   * Get authorization token from localStorage
   */
  getAuthToken() {
    return localStorage.getItem('token')
  }

  /**
   * Build request headers with optional auth token
   */
  getHeaders(includeAuth = true) {
    const headers = { ...this.defaultHeaders }

    if (includeAuth) {
      const token = this.getAuthToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    return headers
  }

  /**
   * Get CSRF cookie from Laravel Sanctum (if needed for cookie-based auth)
   */
  async getCsrfToken() {
    try {
      await fetch(`${this.baseURL}/sanctum/csrf-cookie`, {
        method: 'GET',
        credentials: 'include',
      })
    } catch (error) {
      console.warn('Failed to fetch CSRF token:', error)
    }
  }

  /**
   * Make HTTP request
   */
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body = null,
      headers = {},
      includeAuth = true,
      credentials = 'include', // Important for CORS
      ...otherOptions
    } = options

    const url = `${this.baseURL}${endpoint}`
    const config = {
      method,
      headers: { ...this.getHeaders(includeAuth), ...headers },
      credentials, // Include credentials for CORS
      ...otherOptions,
    }

    if (body) {
      config.body = typeof body === 'string' ? body : JSON.stringify(body)
    }

    try {
      const response = await fetch(url, config)
      return this.handleResponse(response)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Handle API response
   */
  async handleResponse(response) {
    const contentType = response.headers.get('content-type')
    const data = contentType?.includes('application/json')
      ? await response.json()
      : await response.text()

    if (!response.ok) {
      const error = new Error(data.message || `HTTP ${response.status}`)
      error.status = response.status
      error.data = data
      throw error
    }

    return {
      status: response.status,
      data,
      ok: response.ok,
    }
  }

  /**
   * Handle fetch errors
   */
  handleError(error) {
    console.error('API Error:', error)
    
    // Check if it's a network error
    if (!error.status) {
      const networkError = new Error('Network error - please check your connection')
      networkError.originalError = error
      throw networkError
    }
    
    throw error
  }

  // Convenience methods
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' })
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body })
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body })
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', body })
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' })
  }
}

export default new APIClient()