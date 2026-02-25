const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://primewallet.duckdns.org'
const LOCALHOST_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

class APIError extends Error {
  constructor(message, status, data, url) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.data = data
    this.url = url
  }
}

class APIClient {
  constructor(baseURL = API_BASE_URL) {
    const normalized = this.normalizeBaseURL(baseURL)
    this.originURL = normalized
    this.apiBaseURL = `${normalized}/api`
    this.unauthorizedHandler = null
    this.defaultHeaders = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    }
  }

  normalizeBaseURL(baseURL) {
    const parsed = new URL(baseURL)
    const isLocalhost = LOCALHOST_HOSTS.has(parsed.hostname)
    if (!isLocalhost && parsed.protocol !== 'https:') {
      throw new Error(`Insecure API URL "${baseURL}". Production API calls must use HTTPS.`)
    }

    return parsed.href.replace(/\/$/, '')
  }

  setUnauthorizedHandler(handler) {
    this.unauthorizedHandler = typeof handler === 'function' ? handler : null
  }

  getHeaders(extraHeaders = {}) {
    return {
      ...this.defaultHeaders,
      ...extraHeaders,
    }
  }

  buildURL(endpoint, useApiPrefix = true) {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      const absoluteUrl = new URL(endpoint)
      const isLocalhost = LOCALHOST_HOSTS.has(absoluteUrl.hostname)
      if (!isLocalhost && absoluteUrl.protocol !== 'https:') {
        throw new Error(`Blocked insecure request URL "${endpoint}".`)
      }

      return absoluteUrl.toString()
    }

    const base = useApiPrefix ? this.apiBaseURL : this.originURL
    return `${base}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  }

  async getCsrfCookie() {
    const csrfUrl = `${this.originURL}/sanctum/csrf-cookie`
    await fetch(csrfUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
  }

  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body = null,
      headers = {},
      skipCsrf = false,
      useApiPrefix = true,
      ...otherOptions
    } = options

    const normalizedMethod = method.toUpperCase()
    if (!skipCsrf && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(normalizedMethod)) {
      await this.getCsrfCookie()
    }

    const url = this.buildURL(endpoint, useApiPrefix)
    const response = await fetch(url, {
      method: normalizedMethod,
      headers: this.getHeaders(headers),
      credentials: 'include',
      body: body == null ? undefined : (typeof body === 'string' ? body : JSON.stringify(body)),
      ...otherOptions,
    })

    return this.handleResponse(response)
  }

  async handleResponse(response) {
    const contentType = response.headers.get('content-type') || ''
    const data = contentType.includes('application/json')
      ? await response.json()
      : await response.text()

    if (!response.ok) {
      const message = data?.message || `HTTP ${response.status}`
      const error = new APIError(message, response.status, data, response.url)

      if (response.status === 401 && this.unauthorizedHandler) {
        this.unauthorizedHandler(error)
      }

      throw error
    }

    return {
      ok: true,
      status: response.status,
      data,
    }
  }

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

export { APIClient, APIError }
export default new APIClient()
