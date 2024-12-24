import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../utils/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        await router.push('/')
      }
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Verifying...</h2>
        <p className="mt-2 text-gray-600">Please wait while we verify your authentication.</p>
      </div>
    </div>
  )
}
