import { useState, type FormEvent } from 'react'
import { useAuth } from './AuthProvider'
import type { AuthMode } from './core/auth'

export default function AuthForm({ lang = 'zh' }: { lang?: 'zh' | 'en' }) {
  const { login, signup, magicLink, configured } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup' | 'magic_link'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!configured) return null

  const labels = {
    login: { zh: '登录', en: 'Log in' },
    signup: { zh: '注册', en: 'Sign up' },
    magic_link: { zh: '免密登录', en: 'Magic link' },
    email: { zh: '邮箱', en: 'Email' },
    password: { zh: '密码', en: 'Password' },
    submit: {
      login: { zh: '进入书房', en: 'Enter the room' },
      signup: { zh: '创建账户', en: 'Create account' },
      magic_link: { zh: '发送登录链接', en: 'Send login link' },
    },
    switchTo: {
      login: { zh: '没有账户？注册', en: 'No account? Sign up' },
      signup: { zh: '已有账户？登录', en: 'Have an account? Log in' },
      magic_link: { zh: '用密码登录', en: 'Log in with password' },
    },
    emailPlaceholder: { zh: 'your@email.com', en: 'your@email.com' },
    passwordPlaceholder: { zh: '至少 6 位', en: 'At least 6 characters' },
    confirmationSent: { zh: '确认邮件已发送，请查收。', en: 'Confirmation email sent. Please check your inbox.' },
    magicLinkSent: { zh: '登录链接已发送到你的邮箱。', en: 'Login link sent to your email.' },
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      if (mode === 'login') {
        const result = await login(email, password)
        if (!result.success) setError(result.error?.message ?? 'Login failed')
      } else if (mode === 'signup') {
        const result = await signup(email, password)
        if (!result.success) {
          setError(result.error?.message ?? 'Signup failed')
        } else if (result.needsConfirmation) {
          setSuccess(labels.confirmationSent[lang])
        }
      } else {
        const result = await magicLink(email)
        if (!result.success) {
          setError(result.error?.message ?? 'Failed to send link')
        } else {
          setSuccess(labels.magicLinkSent[lang])
        }
      }
    } catch {
      setError(lang === 'zh' ? '网络错误，请稍后重试' : 'Network error, please try again')
    } finally {
      setSubmitting(false)
    }
  }

  function cycleMode() {
    if (mode === 'login') setMode('signup')
    else if (mode === 'signup') setMode('magic_link')
    else setMode('login')
  }

  const nextMode: AuthMode = mode === 'login' ? 'signup' : mode === 'signup' ? 'magic_link' : 'login'

  return (
    <div className="auth-form">
      <div className="auth-mode-tabs">
        {(['login', 'signup', 'magic_link'] as AuthMode[]).map((m) => (
          <button
            key={m}
            type="button"
            className={mode === m ? 'auth-tab active' : 'auth-tab'}
            onClick={() => { setMode(m); setError(''); setSuccess('') }}
          >
            {labels[m][lang]}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="auth-email">{labels.email[lang]}</label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={labels.emailPlaceholder[lang]}
            required
            autoComplete="email"
          />
        </div>

        {mode !== 'magic_link' && (
          <div className="auth-field">
            <label htmlFor="auth-password">{labels.password[lang]}</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={labels.passwordPlaceholder[lang]}
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </div>
        )}

        {error && <p className="auth-error">{error}</p>}
        {success && <p className="auth-success">{success}</p>}

        <button type="submit" className="auth-submit" disabled={submitting}>
          {submitting
            ? (lang === 'zh' ? '处理中...' : 'Processing...')
            : labels.submit[mode][lang]}
        </button>
      </form>

      <button type="button" className="auth-switch" onClick={cycleMode}>
        {labels.switchTo[nextMode][lang]}
      </button>
    </div>
  )
}
