import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import {
  getCurrentSession,
  getCurrentUser,
  onAuthStateChange,
  loginWithEmail,
  logout as authLogout,
  isSupabaseConfigured,
} from './core/auth'
import type { AuthUser, AuthSession, AuthError } from './core/auth'

interface AuthContextValue {
  user: AuthUser | null
  session: AuthSession | null
  loading: boolean
  configured: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error: AuthError | null }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)
  const configured = isSupabaseConfigured()

  useEffect(() => {
    if (!configured) {
      setLoading(false)
      return
    }

    let unsub: { unsubscribe: () => void } | null = null

    ;(async () => {
      const currentSession = await getCurrentSession()
      const currentUser = await getCurrentUser()
      setSession(currentSession)
      setUser(currentUser)
      setLoading(false)

      unsub = onAuthStateChange((newSession) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)
      })
    })()

    return () => {
      unsub?.unsubscribe()
    }
  }, [configured])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await loginWithEmail(email, password)
      if (result.session) {
        setSession(result.session)
        setUser(result.session.user)
        return { success: true, error: null }
      }
      return { success: false, error: result.error ?? null }
    } catch {
      return { success: false, error: null }
    }
  }, [])

  const logoutFn = useCallback(async () => {
    await authLogout()
    setUser(null)
    setSession(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, loading, configured, login, logout: logoutFn }}>
      {children}
    </AuthContext.Provider>
  )
}
