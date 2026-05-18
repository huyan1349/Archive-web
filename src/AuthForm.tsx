import { useState, type FormEvent } from 'react'
import { useAuth } from './AuthProvider'

export default function AuthForm({ lang = 'zh' }: { lang?: 'zh' | 'en' }) {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const labels = {
    username: { zh: '用户名', en: 'Username' },
    password: { zh: '密码', en: 'Password' },
    submit: { zh: '进入书房', en: 'Enter the room' },
    usernamePlaceholder: { zh: 'huyan', en: 'huyan' },
    passwordPlaceholder: { zh: '密码', en: 'Password' },
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const result = login(username, password)
    if (!result.success) {
      setError(result.error?.message ?? (lang === 'zh' ? '登录失败' : 'Login failed'))
    }
  }

  return (
    <div className="auth-form">
      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="auth-username">{labels.username[lang]}</label>
          <input
            id="auth-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={labels.usernamePlaceholder[lang]}
            required
            autoComplete="username"
          />
        </div>

        <div className="auth-field">
          <label htmlFor="auth-password">{labels.password[lang]}</label>
          <input
            id="auth-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={labels.passwordPlaceholder[lang]}
            required
            autoComplete="current-password"
          />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="auth-submit">
          {labels.submit[lang]}
        </button>
      </form>
    </div>
  )
}
