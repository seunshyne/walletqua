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
      'X-Requested-With': 'XMLHttpRequest',
    }
  }

  /**
   * Build request headers
   */
  getHeaders() {
    return { ...this.defaultHeaders }
  }

  /**
   * Read a cookie value by name
   */
  getCookie(name) {
    if (typeof document === 'undefined') return null
    const encodedName = `${encodeURIComponent(name)}=`
    const cookie = document.cookie
      .split('; ')
      .find((entry) => entry.startsWith(encodedName))

    if (!cookie) return null
    return cookie.substring(encodedName.length)
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
    } catch (error) {
      console.warn('Failed to get CSRF cookie:', error)
    }
  }

  /**
   * Handle 401 globally - session expired or not logged in
   * Dynamically imports store to avoid circular dependency
   */
  handleUnauthorized() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:unauthorized'))
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
      ...otherOptions
    } = options

    // Get CSRF cookie before state-changing requests
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
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

    // Laravel expects X-XSRF-TOKEN header for state-changing requests.
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
      const xsrfToken = this.getCookie('XSRF-TOKEN')
      if (xsrfToken) {
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken)
      }
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

     // Handle session expiry globally
    if (response.status === 401) {
      await this.handleUnauthorized()
      const error = new Error('Unauthenticated')
      error.status = 401
      error.data = data
      throw error
    }

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
    console.error('API Network Error:', error)
    const apiError = new Error(error.message || 'Network error')
    apiError.originalError = error
    throw apiError
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
