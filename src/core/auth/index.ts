export { isSupabaseConfigured } from './supabase'
export { signUpWithEmail, loginWithEmail, sendMagicLink, logout, getCurrentSession, getCurrentUser, onAuthStateChange } from './auth'
export type { AuthUser, AuthSession, AuthMode, AuthState, AuthError, SignUpResult, LoginResult, MagicLinkResult } from './types'
