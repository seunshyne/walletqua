import { defineStore } from 'pinia'
import adminUserService from 'src/services/adminUserService'

// Visual accents are assigned locally so backend user data can stay presentation-agnostic.
const accentPalette = ['indigo', 'sand', 'slate', 'rose', 'teal', 'amber']

// Normalize backend enum-like strings into UI-friendly labels.
const toTitleCase = (value = '') =>
  String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

// Convert API timestamps into lightweight "x time ago" labels for the table and summary cards.
const formatRelativeDate = (value) => {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000))
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  const diffDays = Math.round(diffHours / 24)
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

// Keep a stable date string for detail views where we want exact dates instead of relative time.
const formatDate = (value) => {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toISOString().slice(0, 10)
}

// Build fallback initials locally so the UI still looks complete even if the API does not send avatars.
const deriveInitials = (name, email) => {
  if (name) {
    const parts = String(name).trim().split(/\s+/).slice(0, 2)
    return parts.map((part) => part[0]?.toUpperCase() || '').join('') || 'AU'
  }
  return String(email || 'AU').slice(0, 2).toUpperCase()
}

// The admin user resource exposes wallet.transactions, so we map that exact payload into the UI model.
const normalizeTransaction = (transaction) => ({
  id: String(transaction?.id || transaction?.reference || 'TXN'),
  type: toTitleCase(transaction?.type || 'Transaction'),
  amount: Number(transaction?.amount || 0),
  status: toTitleCase(transaction?.status || 'Completed'),
  date: transaction?.created_at || 'Unknown',
  channel: 'Wallet',
  reference: transaction?.reference || 'N/A',
  description: transaction?.description || 'No description provided.',
})

// This is the main adapter between backend user payloads and the frontend page model.
// It merges API data with any already-cached user so list and detail views stay consistent.
const normalizeUser = (user, index = 0, existingUser = {}) => {
  const id = String(user?.id || existingUser.id || '')
  const name = user?.name || existingUser.name || 'Unknown User'
  const email = user?.email || existingUser.email || ''
  const createdAt = user?.created_at || existingUser.joinedDate || ''
  const wallet = user?.wallet || existingUser.wallet || {}
  const transactions = Array.isArray(wallet?.transactions)
    ? wallet.transactions.map(normalizeTransaction)
    : existingUser.transactions || []

  return {
    ...existingUser,
    ...user,
    id,
    name,
    email,
    status: toTitleCase(user?.status || existingUser.status || 'Active'),
    walletBalance: Number(
      user?.wallet_balance ??
      wallet?.balance ??
      existingUser.walletBalance ??
      0
    ),
    joinedLabel: formatRelativeDate(createdAt),
    joinedDate: formatDate(createdAt),
    initials: deriveInitials(name, email),
    accent: existingUser.accent || accentPalette[index % accentPalette.length],
    role: toTitleCase(user?.role || existingUser.role || 'User'),
    wallet: {
      currency: wallet?.currency || existingUser.wallet?.currency || 'USD',
      availableBalance: Number(wallet?.balance ?? existingUser.wallet?.availableBalance ?? 0),
      ledgerBalance: Number(wallet?.balance ?? existingUser.wallet?.ledgerBalance ?? 0),
      address: wallet?.address || existingUser.wallet?.address || 'Not available',
      transactions,
    },
    transactions,
  }
}

// Support common API response wrappers like { users: [] } or { data: [] }.
const unwrapUsersPayload = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.users)) return payload.users
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.users)) return payload.data.users
  return []
}

// Support common single-resource response wrappers like { user: {...} } or { data: {...} }.
const unwrapUserPayload = (payload) =>
  payload?.user || payload?.data?.user || payload?.data || payload

// Detect whether a response contains a real user payload or just a message wrapper.
const looksLikeUserPayload = (payload) =>
  Boolean(
    payload &&
    typeof payload === 'object' &&
    (
      Object.prototype.hasOwnProperty.call(payload, 'id') ||
      Object.prototype.hasOwnProperty.call(payload, 'email') ||
      Object.prototype.hasOwnProperty.call(payload, 'name') ||
      Object.prototype.hasOwnProperty.call(payload, 'status')
    )
  )

export const useAdminUserStore = defineStore('adminUserStore', {
  // Store both the list view data and the currently opened detail record.
  state: () => ({
    users: [],
    selectedUser: null,
    isLoading: false,
    isDetailLoading: false,
    actionUserId: null,
    error: '',
    actionMessage: '',
  }),

  getters: {
    // Reuse the selected detail record when possible, otherwise fall back to the cached list.
    getUserById: (state) => (id) =>
      state.selectedUser?.id === String(id)
        ? state.selectedUser
        : state.users.find((user) => String(user.id) === String(id)),
  },

  actions: {
    // Load the admin users table from the backend and normalize it for the UI.
    async fetchUsers(force = false) {
      if (this.isLoading) return this.users
      if (this.users.length && !force) return this.users

      this.isLoading = true
      this.error = ''

      try {
        const payload = await adminUserService.getUsers()
        const rawUsers = unwrapUsersPayload(payload)
        this.users = rawUsers.map((user, index) => normalizeUser(user, index))
        return this.users
      } catch (error) {
        this.error = error.message || 'Failed to load admin users.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Load one user's full detail payload and sync it back into the cached list.
    async fetchUser(id) {
      this.isDetailLoading = true
      this.error = ''

      try {
        const payload = await adminUserService.getUser(id)
        const rawUser = unwrapUserPayload(payload)
        const existingUser = this.users.find((user) => String(user.id) === String(id))
        const index = existingUser ? this.users.findIndex((user) => String(user.id) === String(id)) : 0
        const normalized = normalizeUser(rawUser, index, existingUser)

        this.selectedUser = normalized

        if (existingUser) {
          this.users = this.users.map((user) => (String(user.id) === String(id) ? normalized : user))
        } else {
          this.users = [...this.users, normalized]
        }

        return normalized
      } catch (error) {
        this.error = error.message || 'Failed to load user details.'
        throw error
      } finally {
        this.isDetailLoading = false
      }
    },

    // Toggle user status through the admin API and sync the updated record back into the UI cache.
    async toggleUserSuspension(id) {
      const userId = String(id)
      const existingUser = this.users.find((user) => String(user.id) === userId) || this.selectedUser
      const shouldUnsuspend = existingUser?.status === 'Suspended'

      this.actionUserId = userId
      this.error = ''
      this.actionMessage = ''

      try {
        const payload = shouldUnsuspend
          ? await adminUserService.unsuspendUser(userId)
          : await adminUserService.suspendUser(userId)

        const rawUser = unwrapUserPayload(payload)
        const normalized = looksLikeUserPayload(rawUser)
          ? normalizeUser(
              rawUser,
              this.users.findIndex((user) => String(user.id) === userId),
              existingUser || {}
            )
          : {
              ...(existingUser || {}),
              status: shouldUnsuspend ? 'Active' : 'Suspended',
            }

        this.users = this.users.map((user) =>
          String(user.id) === userId ? { ...user, ...normalized } : user
        )

        if (this.selectedUser && String(this.selectedUser.id) === userId) {
          this.selectedUser = { ...this.selectedUser, ...normalized }
        }

        this.actionMessage = payload?.message || (shouldUnsuspend ? 'User restored.' : 'User suspended.')
        return normalized
      } catch (error) {
        this.error = error.message || 'Failed to update user status.'
        throw error
      } finally {
        this.actionUserId = null
      }
    },
  },
})
