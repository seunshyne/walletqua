import { API_BASE_URL } from 'src/constants/api'

const ADMIN_API_BASE_URL = API_BASE_URL
const ADMIN_AUTH_ENDPOINTS = {
  LOGIN: '/api/admin/login',
  LOGOUT: '/api/admin/logout',
  ME: '/api/admin/me',
}

const TOKEN_KEY = 'admin_access_token'
const ADMIN_KEY = 'admin_profile'

const parseJsonSafely = async (response) => {
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }
  return response.text()
}

export const adminAuthService = {
  getToken() {
    if (typeof localStorage === 'undefined') return ''
    return localStorage.getItem(TOKEN_KEY) || ''
  },

  saveSession(token, admin) {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(TOKEN_KEY, token)
    if (admin) {
      localStorage.setItem(ADMIN_KEY, JSON.stringify(admin))
    }
  },

  clearSession() {
    if (typeof localStorage === 'undefined') return
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ADMIN_KEY)
  },

  getSavedAdmin() {
    if (typeof localStorage === 'undefined') return null
    const raw = localStorage.getItem(ADMIN_KEY)
    if (!raw) return null

    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  },

  async login(email, password) {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}${ADMIN_AUTH_ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await parseJsonSafely(response)

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          message: data?.message || 'Admin login failed',
          error: data?.errors || { general: data?.message || 'Admin login failed' },
        }
      }

      const token = data?.token || ''
      const admin = data?.user || null

      if (!token) {
        return {
          success: false,
          message: 'Login succeeded but no admin token was returned.',
          error: { general: 'Login succeeded but no admin token was returned.' },
        }
      }

      this.saveSession(token, admin)

      return {
        success: true,
        token,
        admin,
        message: 'Admin login successful',
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Unable to reach admin login service',
        error: { general: error.message || 'Unable to reach admin login service' },
      }
    }
  },

  async getCurrentAdmin() {
    const token = this.getToken()
    if (!token) {
      return { success: false, unauthenticated: true }
    }

    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}${ADMIN_AUTH_ENDPOINTS.ME}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await parseJsonSafely(response)

      if (response.status === 401 || response.status === 403) {
        this.clearSession()
        return { success: false, unauthenticated: true }
      }

      if (!response.ok) {
        return {
          success: false,
          unauthenticated: false,
          error: data?.message || 'Failed to load admin profile',
        }
      }

      const admin = data?.user || null

      if (!admin) {
        return {
          success: false,
          unauthenticated: false,
          error: 'Admin profile response did not include a user payload.',
        }
      }

      this.saveSession(token, admin)

      return {
        success: true,
        admin,
        token,
      }
    } catch (error) {
      return {
        success: false,
        unauthenticated: false,
        error: error.message || 'Failed to load admin profile',
      }
    }
  },

  async logout() {
    const token = this.getToken()

    try {
      if (token) {
        await fetch(`${ADMIN_API_BASE_URL}${ADMIN_AUTH_ENDPOINTS.LOGOUT}`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
      }
    } finally {
      this.clearSession()
    }
  },
}

export default adminAuthService
