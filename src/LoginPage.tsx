import { useState, useEffect, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from './AuthProvider'

const taglines = [
  { zh: '一间纸上的阅读房间', en: 'A Quiet Place for Your Reading Life' },
  { zh: '每一本书，都会形成一个房间', en: 'Every book becomes a room' },
  { zh: '像撕下的纸条，被夹回旧书页之间', en: 'Like torn paper slips between old pages' },
  { zh: '你的阅读人生，按季节排列', en: 'Your reading life, arranged by season' },
  { zh: '不是 Dashboard，是一间纸上的阅读房间', en: 'Not a dashboard — a printed reading room' },
]

export default function LoginPage({ lang = 'zh', onClose }: { lang?: 'zh' | 'en'; onClose?: () => void }) {
  const { login, user } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [taglineIndex, setTaglineIndex] = useState(0)
  const [taglineVisible, setTaglineVisible] = useState(true)
  const [focused, setFocused] = useState<string | null>(null)

  useEffect(() => {
    if (user && onClose) {
      onClose()
    }
  }, [user, onClose])

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineVisible(false)
      setTimeout(() => {
        setTaglineIndex((prev) => (prev + 1) % taglines.length)
        setTaglineVisible(true)
      }, 600)
    }, 4200)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && onClose) onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const result = login(username, password)
    if (!result.success) {
      setError(result.error?.message ?? (lang === 'zh' ? '登录失败' : 'Login failed'))
    }
  }

  const t = {
    username: lang === 'zh' ? '用户名' : 'Username',
    password: lang === 'zh' ? '密码' : 'Password',
    submit: lang === 'zh' ? '进入书房' : 'Enter the Room',
    usernamePh: lang === 'zh' ? '输入用户名' : 'Enter username',
    passwordPh: lang === 'zh' ? '输入密码' : 'Enter password',
    welcome: lang === 'zh' ? '欢迎回来' : 'Welcome Back',
    subtitle: lang === 'zh' ? '登录以进入你的阅读房间' : 'Sign in to enter your reading room',
    hint: lang === 'zh' ? '数据安全地留在你的设备上' : 'Your data stays safely on your device',
    skip: lang === 'zh' ? '跳过，稍后再说' : 'Skip for now',
    close: lang === 'zh' ? '返回' : 'Go back',
  }

  return createPortal(
    <section className="login-page">
      <div className="login-paper-noise" />

      <div className="login-ambient-shape login-shape-1" />
      <div className="login-ambient-shape login-shape-2" />
      <div className="login-ambient-shape login-shape-3" />

      {onClose && (
        <button type="button" className="login-close" onClick={onClose} aria-label={t.close}>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M18 6L6 18M6 6l12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>{t.close}</span>
        </button>
      )}

      <div className="login-content">
        <div className="login-brand">
          <div className="login-logo-wrap">
            <svg viewBox="0 0 48 48" className="login-logo-svg">
              <path
                className="login-logo-mark"
                fillRule="evenodd"
                d="M14 8h18c3.3 0 6 2.7 6 6v25H16.5A6.5 6.5 0 0 1 10 32.5V12a4 4 0 0 1 4-4Zm4 5.5v18.8c0 1.2 1 2.2 2.2 2.2H32V13.5H18Zm3.5 4a1.5 1.5 0 0 1 3 0v13a1.5 1.5 0 0 1-3 0v-13Zm-4.5 18.8a1.2 1.2 0 0 0 0 2.4h17a1.2 1.2 0 0 0 0-2.4H17Z"
              />
            </svg>
          </div>
          <h1 className="login-title">LUCERNA</h1>
          <p className="login-title-sub">Archive</p>
        </div>

        <div className="login-tagline-wrap">
          <p className={`login-tagline ${taglineVisible ? 'visible' : ''}`}>
            {lang === 'zh' ? taglines[taglineIndex].zh : taglines[taglineIndex].en}
          </p>
        </div>

        <div className="login-divider">
          <span className="login-divider-line" />
          <span className="login-divider-ornament">✦</span>
          <span className="login-divider-line" />
        </div>

        <div className="login-form-card">
          <div className="login-form-header">
            <h2 className="login-form-title">{t.welcome}</h2>
            <p className="login-form-subtitle">{t.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form-body">
            <div className={`login-field ${focused === 'username' ? 'focused' : ''}`}>
              <label htmlFor="login-username">{t.username}</label>
              <div className="login-field-inner">
                <span className="login-field-icon" aria-hidden="true">
                  <svg viewBox="0 0 20 20" width="18" height="18">
                    <path d="M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8c0-3.87 3.13-7 7-7s7 3.13 7 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocused('username')}
                  onBlur={() => setFocused(null)}
                  placeholder={t.usernamePh}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className={`login-field ${focused === 'password' ? 'focused' : ''}`}>
              <label htmlFor="login-password">{t.password}</label>
              <div className="login-field-inner">
                <span className="login-field-icon" aria-hidden="true">
                  <svg viewBox="0 0 20 20" width="18" height="18">
                    <rect x="3" y="9" width="14" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M6 9V6a4 4 0 1 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder={t.passwordPh}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="login-submit">
              <span className="login-submit-text">{t.submit}</span>
              <span className="login-submit-arrow" aria-hidden="true">→</span>
            </button>
          </form>

          {onClose && (
            <button type="button" className="login-skip" onClick={onClose}>
              {t.skip}
            </button>
          )}

          <p className="login-hint">{t.hint}</p>
        </div>
      </div>

      <div className="login-footer">
        <span className="login-footer-mark" aria-hidden="true">
          <svg viewBox="0 0 48 48" width="20" height="20">
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M14 8h18c3.3 0 6 2.7 6 6v25H16.5A6.5 6.5 0 0 1 10 32.5V12a4 4 0 0 1 4-4Zm4 5.5v18.8c0 1.2 1 2.2 2.2 2.2H32V13.5H18Zm3.5 4a1.5 1.5 0 0 1 3 0v13a1.5 1.5 0 0 1-3 0v-13Zm-4.5 18.8a1.2 1.2 0 0 0 0 2.4h17a1.2 1.2 0 0 0 0-2.4H17Z"
            />
          </svg>
        </span>
        <span className="login-footer-text">
          {lang === 'zh' ? 'LUCERNA Archive · Phase 1' : 'LUCERNA Archive · Phase 1'}
        </span>
      </div>
    </section>,
    document.body,
  )
}
