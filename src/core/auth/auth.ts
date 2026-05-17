import { getSupabase, isSupabaseConfigured } from './supabase'
import type { AuthUser, AuthSession, SignUpResult, LoginResult, MagicLinkResult, AuthError } from './types'

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
  const sb = getSupabase()
  if (!sb) return
  await sb.auth.signOut()
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  const sb = getSupabase()
  if (!sb) return null

  const { data } = await sb.auth.getSession()
  if (!data.session) return null

  return mapSession(data.session as unknown as Record<string, unknown>)
}

export async function getCurrentUser(): Promise<AuthUser | null> {
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
