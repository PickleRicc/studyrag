import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()

  // Don't redirect during the authentication process
  if (req.nextUrl.pathname === '/') {
    return res
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => res.cookies.set({ name, value, ...options }),
        remove: (name, options) => res.cookies.set({ name, value: '', ...options }),
      },
    }
  )

  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Middleware auth error:', error)
      return res
    }

    const isAuthPage = req.nextUrl.pathname.startsWith('/auth/')
    const isAuthenticated = !!session

    console.log('Current path:', req.nextUrl.pathname)
    console.log('Is auth page:', isAuthPage)
    console.log('Is authenticated:', isAuthenticated)

    // If authenticated and trying to access auth pages, redirect to home
    if (isAuthenticated && isAuthPage) {
      console.log('Redirecting to home...')
      const redirectUrl = new URL('/', req.url)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return res
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
