/**
 * HTTP Client - Core API communication layer
 * Handles all HTTP requests with automatic token injection and error handling
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://primewallet.duckdns.org'

class APIClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = `${baseURL}/api`
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
   * Get CSRF cookie from Laravel Sanctum
   */
  async getCsrfCookie() {
    try {
      const csrfUrl = `${new URL(this.baseURL).origin}/sanctum/csrf-cookie`
      await fetch(csrfUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      })
      console.log('CSRF cookie obtained')
    } catch (error) {
      console.warn('Failed to get CSRF cookie:', error)
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
      skipCsrf = false,
      ...otherOptions
    } = options

    // Get CSRF cookie before state-changing requests
    if (!skipCsrf && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
      await this.getCsrfCookie()
    }

    const url = `${this.baseURL}${endpoint}`
    
    console.log('Making request to:', url) // Debug log
    
    const config = {
      method,
      headers: { ...this.getHeaders(includeAuth), ...headers },
      credentials: 'include', // Important for CSRF cookies
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
      
      console.error('API Response Error:', {
        status: response.status,
        url: response.url,
        data
      })
      
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
    const apiError = new Error(error.message || 'Network error')
    apiError.originalError = error
    throw apiError
  }

  // Convenience methods
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' })
  }

  post(endpoint, body, options = {}) {
    console.log('POST request to:', endpoint, 'with body:', body) // Debug log
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
