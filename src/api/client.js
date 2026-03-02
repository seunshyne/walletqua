/**
 * HTTP Client - Core API communication layer
 * Handles all HTTP requests with automatic CSRF handling and error handling.
 * Uses HttpOnly session cookies (Laravel Sanctum) — no tokens in localStorage.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://primewallet.duckdns.org'

class APIClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = `${baseURL}/api`
    this.csrfUrl = `${baseURL}/sanctum/csrf-cookie`
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }

  /**
   * Read a cookie value by name
   */
  getCookie(name) {
    if (typeof document === 'undefined') return null
    const match = document.cookie
      .split('; ')
      .find((entry) => entry.startsWith(`${name}=`))
    return match ? decodeURIComponent(match.split('=')[1]) : null
  }

  /**
   * Fetch CSRF cookie from Laravel Sanctum only if not already set.
   * Laravel sets XSRF-TOKEN (JS-readable) and laravel_session (HttpOnly).
   */
  async ensureCsrf() {
    const response = await fetch(this.csrfUrl, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' },
    })

    if (!response.ok) {
      const error = new Error(`Failed to fetch CSRF cookie: HTTP ${response.status}`)
      error.status = response.status
      error.url = this.csrfUrl
      throw error
    }

    const xsrfToken = this.getCookie('XSRF-TOKEN')
    if (!xsrfToken) {
      const error = new Error(
        'CSRF cookie was not set. Check CORS/SameSite/Secure/domain config.'
      )
      error.status = response.status
      error.url = this.csrfUrl
      throw error
    }
  }

  /**
   * Build base request headers
   */
  getHeaders() {
    return { ...this.defaultHeaders }
  }

  /**
   * Handle 401 globally — session expired or not authenticated.
   * Dispatches a custom event so the auth store/router can react.
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
      skipUnauthorizedHandler = false,
      ...otherOptions
    } = options

    const normalizedMethod = method.toUpperCase()
    const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(normalizedMethod)

    // Ensure CSRF cookie is set before any state-changing request
    if (isStateChanging) {
      await this.ensureCsrf()
    }

    const url = `${this.baseURL}${endpoint}`

    const config = {
      method: normalizedMethod,
      headers: { ...this.getHeaders(), ...headers },
      credentials: 'include', // Required for session + CSRF cookies
      ...otherOptions,
    }

    // Attach XSRF token header for Laravel CSRF verification
    if (isStateChanging) {
      const xsrfToken = this.getCookie('XSRF-TOKEN')
      if (!xsrfToken) {
        const error = new Error(
          'CSRF cookie was not set. Check CORS/SameSite/Secure/domain config.'
        )
        error.url = url
        throw error
      }
      config.headers['X-XSRF-TOKEN'] = xsrfToken
    }

    if (body) {
      config.body = typeof body === 'string' ? body : JSON.stringify(body)
    }

    try {
      const response = await fetch(url, config)
      return this.handleResponse(response, { skipUnauthorizedHandler })
    } catch (error) {
      return this.handleError(error, url)
    }
  }

  /**
   * Handle API response
   */
  async handleResponse(response, options = {}) {
    const { skipUnauthorizedHandler = false } = options
    const contentType = response.headers.get('content-type')
    const data = contentType?.includes('application/json')
      ? await response.json()
      : await response.text()

    if (response.status === 401) {
      if (!skipUnauthorizedHandler) {
        this.handleUnauthorized()
      }
      const error = new Error('Unauthenticated')
      error.status = 401
      error.data = data
      error.url = response.url
      throw error
    }

    if (!response.ok) {
      const error = new Error(data.message || `HTTP ${response.status}`)
      error.status = response.status
      error.data = data
      error.url = response.url
      console.error('API Error:', { status: response.status, url: response.url, data })
      throw error
    }

    return { status: response.status, data, ok: response.ok }
  }

  /**
   * Handle network/fetch errors
   */
  handleError(error, requestUrl) {
    console.error('API Network Error:', error)
    const apiError = new Error(error.message || 'Network error')
    apiError.status = error.status
    apiError.data = error.data
    apiError.url = error.url || requestUrl
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
