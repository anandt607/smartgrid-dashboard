// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

// Format date
export const formatDate = (date, options = {}) => {
  if (!date) return 'N/A'
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }
  
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return 'Invalid Date'
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj)
  } catch (error) {
    return 'Invalid Date'
  }
}

// Format date and time
export const formatDateTime = (date) => {
  if (!date) return 'N/A'
  
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return 'Invalid Date'
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj)
  } catch (error) {
    return 'Invalid Date'
  }
}

// Format relative time (e.g., "2 days ago")
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A'
  
  try {
    const now = new Date()
    const past = new Date(date)
    if (isNaN(past.getTime())) return 'Invalid Date'
    
    const diffInSeconds = Math.floor((now - past) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    
    return formatDate(date)
  } catch (error) {
    return 'Invalid Date'
  }
}

// Format number with commas
export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num)
}

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '??'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate password strength
export const validatePasswordStrength = (password) => {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  const isValid = password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers
  
  return {
    isValid,
    minLength: password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
  }
}

// Generate random color
export const getRandomColor = () => {
  const colors = ['blue', 'green', 'red', 'purple', 'orange', 'cyan', 'magenta']
  return colors[Math.floor(Math.random() * colors.length)]
}

// Debounce function
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

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

// Check if object is empty
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0
}

// Sleep/delay function
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Get plan badge color
export const getPlanColor = (plan) => {
  const colors = {
    free: 'default',
    pro: 'blue',
    enterprise: 'purple',
  }
  return colors[plan?.toLowerCase()] || 'default'
}

// Get status badge color
export const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    cancelled: 'error',
    past_due: 'warning',
    trialing: 'processing',
    incomplete: 'default',
  }
  return colors[status?.toLowerCase()] || 'default'
}
