import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import {
  getLocalSession,
  onAuthStateChange,
  localLogin,
  logout as authLogout,
} from './core/auth'
import type { AuthUser, AuthSession, AuthError } from './core/auth'

interface AuthContextValue {
  user: AuthUser | null
  session: AuthSession | null
  loading: boolean
  login: (username: string, password: string) => { success: boolean; error: AuthError | null }
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

  useEffect(() => {
    const stored = getLocalSession()
    if (stored) {
      setSession(stored)
      setUser(stored.user)
    }
    setLoading(false)

    const unsub = onAuthStateChange((newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
    })

    return () => {
      unsub.unsubscribe()
    }
  }, [])

  const login = useCallback((username: string, password: string) => {
    const result = localLogin(username, password)
    if (result.success && result.session) {
      setSession(result.session)
      setUser(result.session.user)
    }
    return { success: result.success, error: result.error }
  }, [])

  const logoutFn = useCallback(async () => {
    await authLogout()
    setUser(null)
    setSession(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, loading, login, logout: logoutFn }}>
      {children}
    </AuthContext.Provider>
  )
}
