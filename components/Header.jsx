'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const AUTH_LOGIN_URL = process.env.NEXT_PUBLIC_AUTH_LOGIN_URL ?? 'https://auth.leandrosouza.info/login'
const AUTH_PROFILE_URL = process.env.NEXT_PUBLIC_AUTH_PROFILE_URL ?? 'https://auth.leandrosouza.info/perfil'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pc.leandrosouza.info'

const NAV_LINKS = []

function buildLoginUrl(pathname) {
  try {
    const next = new URL(pathname, SITE_URL).toString()
    const url = new URL(AUTH_LOGIN_URL)
    url.searchParams.set('next', next)
    return url.toString()
  } catch {
    return AUTH_LOGIN_URL
  }
}

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadSession() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (isMounted) {
        setUser(currentUser)
        setLoading(false)
      }
    }

    loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (isMounted) {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  function closeMobileMenu() {
    setMobileMenuOpen(false)
  }

  async function handleSignOut() {
    closeMobileMenu()
    setSigningOut(true)
    await supabase.auth.signOut()
    setSigningOut(false)
    router.push('/')
    router.refresh()
  }

  const loginUrl = buildLoginUrl(pathname)

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md relative">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center" onClick={closeMobileMenu}>
            <div className="text-xl sm:text-2xl font-bold text-slate-800">
              <span className="text-blue-700">Painel</span> de Controle
            </div>
          </Link>

          <div className="hidden md:flex space-x-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <span className="text-sm text-gray-400">...</span>
            ) : user ? (
              <>
                <a
                  href={AUTH_PROFILE_URL}
                  className="text-sm text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  Meu perfil
                </a>
                <span className="text-sm text-gray-600 max-w-[180px] truncate">
                  {user.email}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-60"
                >
                  {signingOut ? 'Saindo...' : 'Sair'}
                </button>
              </>
            ) : (
              <a
                href={loginUrl}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Entrar
              </a>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            {!loading && !user && (
              <a
                href={loginUrl}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Entrar
              </a>
            )}
            {!loading && user && (
              <a
                href={AUTH_PROFILE_URL}
                className="px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium"
              >
                Perfil
              </a>
            )}
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <>
          <button
            type="button"
            className="md:hidden fixed inset-0 top-16 bg-black/30 z-40"
            aria-label="Fechar menu"
            onClick={closeMobileMenu}
          />
          <div
            id="mobile-menu"
            className="md:hidden absolute left-0 right-0 top-16 z-50 bg-white border-t border-gray-200 shadow-lg"
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-gray-200 my-2 pt-2">
                {loading ? (
                  <p className="px-4 py-3 text-sm text-gray-400">Carregando...</p>
                ) : user ? (
                  <>
                    <p className="px-4 py-2 text-sm text-gray-500 truncate">
                      {user.email}
                    </p>
                    <a
                      href={AUTH_PROFILE_URL}
                      onClick={closeMobileMenu}
                      className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium transition-colors"
                    >
                      Meu perfil
                    </a>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-60"
                    >
                      {signingOut ? 'Saindo...' : 'Sair'}
                    </button>
                  </>
                ) : (
                  <a
                    href={loginUrl}
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 rounded-lg bg-blue-600 text-white text-center font-medium hover:bg-blue-700 transition-colors"
                  >
                    Entrar
                  </a>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
