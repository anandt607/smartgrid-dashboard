'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const AuthContext = createContext({})

export function useAuth() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
        } else {
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        
        setUser(session?.user ?? null)
        
        // Only set loading to false after initial load or auth events
        if (event !== 'INITIAL_SESSION') {
          setLoading(false)
        }

        // Handle auth events
        if (event === 'SIGNED_IN') {
          setLoading(false)
          // Don't redirect here - let individual pages handle their own redirects
        } else if (event === 'SIGNED_OUT') {
          router.push('/login')
        } else if (event === 'TOKEN_REFRESHED') {
          // ✅ DON'T redirect on token refresh - preserve current route
          // Just update the user state, no navigation needed
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [router])

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
        throw error
      }
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
