import axios from 'axios'
import { supabase } from '@/lib/supabase/client'

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to attach JWT token from Supabase
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
      }
    } catch (error) {
      console.error('Error getting session:', error)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
          break
        case 403:
          console.error('Access forbidden:', data)
          break
        case 404:
          console.error('Resource not found:', data)
          break
        case 500:
          console.error('Server error:', data)
          break
        default:
          console.error('API error:', data)
      }
      
      return Promise.reject(error.response.data)
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network error:', error.request)
      return Promise.reject({ message: 'Network error. Please check your connection.' })
    } else {
      // Something else happened
      console.error('Error:', error.message)
      return Promise.reject({ message: error.message })
    }
  }
)

export default apiClient
