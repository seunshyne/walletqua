/**
 * Utility Functions
 * Common helper functions used throughout the app
 */

/**
 * Format currency amount
 */
export const formatCurrency = (amount, currency = 'NGN', locale = 'en-NG') => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount)
  } catch (error) {
    return `${currency} ${amount}`
  }
}

/**
 * Truncate wallet address for display
 */
export const truncateAddress = (address, startChars = 6, endChars = 4) => {
  if (!address || address.length <= startChars + endChars) {
    return address
  }
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`
}

/**
 * Format date to readable string
 */
export const formatDate = (date, format = 'short') => {
  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    time: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
  }

  try {
    return new Date(date).toLocaleDateString('en-NG', options[format] || options.short)
  } catch (error) {
    return date
  }
}

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
  }

  const strength = Object.values(checks).filter(Boolean).length

  return {
    isValid: checks.length && checks.lowercase && checks.number,
    strength: strength,
    checks: checks,
  }
}

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return { success: true }
  } catch (error) {
    return { success: false, error }
  }
}

/**
 * Format transaction amount with sign
 */
export const formatTransactionAmount = (amount, type) => {
  const sign = type === 'send' || type === 'withdrawal' ? '-' : '+'
  return `${sign}${Math.abs(amount)}`
}

/**
 * Get transaction status badge color
 */
export const getTransactionStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    completed: 'green',
    failed: 'red',
    cancelled: 'grey',
  }
  return colors[status] || 'grey'
}

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
