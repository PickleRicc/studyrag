import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { useRouter } from 'next/router'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Handle routing based on auth state
  useEffect(() => {
    if (!loading) {
      const path = window.location.pathname
      if (!user && !path.startsWith('/auth/')) {
        router.push('/auth/signin')
      } else if (user && path.startsWith('/auth/')) {
        router.push('/')
      }
    }
  }, [user, loading, router])

  useEffect(() => {
    // Check active sessions and sets the user
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        setUser(session?.user ?? null)
        setLoading(false)
      } catch (error) {
        console.error('Session check error:', error)
        setUser(null)
        setLoading(false)
      }
    }

    checkSession()

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    signUp: async (data) => {
      try {
        const { error } = await supabase.auth.signUp(data)
        if (error) throw error
        return { error: null }
      } catch (error) {
        console.error('Sign up error:', error)
        return { error }
      }
    },
    signIn: async (data) => {
      try {
        const { error } = await supabase.auth.signInWithPassword(data)
        if (error) throw error
        return { error: null }
      } catch (error) {
        console.error('Sign in error:', error)
        return { error }
      }
    },
    signOut: async () => {
      try {
        await supabase.auth.signOut();
        // Clear localStorage
        localStorage.clear();
        window.location.reload();
      } catch (error) {
        console.error('Error signing out:', error);
      }
    },
    user,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
