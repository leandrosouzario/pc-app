import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { getCookieOptions } from './cookie-options'

const AUTH_LOGIN_URL = process.env.NEXT_PUBLIC_AUTH_LOGIN_URL ?? 'https://auth.leandrosouza.info/login'
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pc.leandrosouza.info').replace(/\/$/, '')
const HUB_URL = 'https://hub.leandrosouza.info'

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          supabaseResponse = NextResponse.next({ request })

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
      cookieOptions: getCookieOptions(),
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL(AUTH_LOGIN_URL)
    const returnTo = new URL(request.nextUrl.pathname, SITE_URL).toString()
    loginUrl.searchParams.set('next', returnTo)
    return NextResponse.redirect(loginUrl)
  }

  // Verifica se o usuário tem papel de admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || profile.role !== 'admin') {
    return NextResponse.redirect(HUB_URL)
  }

  return supabaseResponse
}
