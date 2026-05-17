import { getSupabase, isSupabaseConfigured } from './supabase'
import type { AuthUser, AuthSession, SignUpResult, LoginResult, MagicLinkResult, AuthError } from './types'

const LOCAL_ACCOUNTS: Array<{ username: string; password: string; email: string }> = [
  { username: 'huyan', password: '1', email: 'huyan@lucerna.archive' },
]

const SESSION_KEY = 'lucerna:auth-session'

function createLocalSession(account: typeof LOCAL_ACCOUNTS[number]): AuthSession {
  return {
    user: {
      id: `local-${account.username}`,
      email: account.email,
      createdAt: new Date().toISOString(),
    },
    accessToken: `local-token-${Date.now()}`,
    expiresAt: Date.now() / 1000 + 86400 * 30,
  }
}

function getStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthSession
    if (parsed.expiresAt && parsed.expiresAt * 1000 < Date.now()) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function storeSession(session: AuthSession | null): void {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}

export function localLogin(username: string, password: string): LoginResult {
  const account = LOCAL_ACCOUNTS.find(
    (a) => a.username === username && a.password === password,
  )
  if (!account) {
    return {
      success: false,
      error: { message: '用户名或密码不正确' },
    }
  }
  const session = createLocalSession(account)
  storeSession(session)
  return { success: true, error: null, session }
}

export function localLogout(): void {
  storeSession(null)
}

export function getLocalSession(): AuthSession | null {
  return getStoredSession()
}

export function isLocalSession(): boolean {
  return !!getStoredSession()
}

function mapUser(raw: Record<string, unknown>): AuthUser {
  return {
    id: raw.id as string,
    email: raw.email as string,
    createdAt: raw.created_at as string,
  }
}

function mapSession(raw: Record<string, unknown>): AuthSession {
  return {
    user: mapUser(raw.user as Record<string, unknown>),
    accessToken: raw.access_token as string,
    expiresAt: raw.expires_at as number,
  }
}

function mapError(error: { message: string; code?: string }): AuthError {
  const messageMap: Record<string, string> = {
    'Invalid login credentials': '邮箱或密码不正确',
    'User already registered': '这个邮箱已经注册过了',
    'Email not confirmed': '请先确认你的邮箱',
    'Too many requests': '请求太频繁，请稍后再试',
    'Signup is disabled': '暂时无法注册',
  }
  return {
    message: messageMap[error.message] ?? error.message,
    code: error.code,
  }
}

export async function signUpWithEmail(email: string, password: string): Promise<SignUpResult> {
  const sb = getSupabase()
  if (!sb) return { success: false, error: { message: 'Supabase 未配置' } }

  const { data, error } = await sb.auth.signUp({ email, password })

  if (error) {
    return { success: false, error: mapError(error) }
  }

  const needsConfirmation = !data.session && !!data.user
  return {
    success: true,
    error: null,
    needsConfirmation,
    session: data.session ? mapSession(data.session as unknown as Record<string, unknown>) : undefined,
  } as SignUpResult & { session?: AuthSession }
}

export async function loginWithEmail(email: string, password: string): Promise<LoginResult> {
  const sb = getSupabase()
  if (!sb) return { success: false, error: { message: 'Supabase 未配置' } }

  const { data, error } = await sb.auth.signInWithPassword({ email, password })

  if (error) {
    return { success: false, error: mapError(error) }
  }

  return {
    success: true,
    error: null,
    session: data.session ? mapSession(data.session as unknown as Record<string, unknown>) : null,
  }
}

export async function sendMagicLink(email: string): Promise<MagicLinkResult> {
  const sb = getSupabase()
  if (!sb) return { success: false, error: { message: 'Supabase 未配置' } }

  const { error } = await sb.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  })

  if (error) {
    return { success: false, error: mapError(error) }
  }

  return { success: true, error: null }
}

export async function logout(): Promise<void> {
  localLogout()
  const sb = getSupabase()
  if (sb) await sb.auth.signOut()
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  const local = getLocalSession()
  if (local) return local

  const sb = getSupabase()
  if (!sb) return null

  const { data } = await sb.auth.getSession()
  if (!data.session) return null

  return mapSession(data.session as unknown as Record<string, unknown>)
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const local = getLocalSession()
  if (local) return local.user

  const sb = getSupabase()
  if (!sb) return null

  const { data } = await sb.auth.getUser()
  if (!data.user) return null

  return mapUser(data.user as unknown as Record<string, unknown>)
}

export function onAuthStateChange(
  callback: (session: AuthSession | null) => void,
): { unsubscribe: () => void } {
  const sb = getSupabase()
  if (!sb) return { unsubscribe: () => {} }

  const { data } = sb.auth.onAuthStateChange((_event, session) => {
    if (session) {
      callback(mapSession(session as unknown as Record<string, unknown>))
    } else {
      callback(null)
    }
  })

  return { unsubscribe: data.subscription.unsubscribe }
}

export { isSupabaseConfigured }
