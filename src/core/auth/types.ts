export interface AuthUser {
  id: string
  email: string
  createdAt: string
}

export interface AuthSession {
  user: AuthUser
  accessToken: string
  expiresAt: number
}

export type AuthMode = 'login' | 'signup' | 'magic_link'

export interface AuthState {
  user: AuthUser | null
  session: AuthSession | null
  loading: boolean
  configured: boolean
}

export interface AuthError {
  message: string
  code?: string
}

export interface SignUpResult {
  success: boolean
  error: AuthError | null
  needsConfirmation?: boolean
}

export interface LoginResult {
  success: boolean
  error: AuthError | null
  session?: AuthSession | null
}

export interface MagicLinkResult {
  success: boolean
  error: AuthError | null
}
