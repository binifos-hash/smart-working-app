import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import * as api from '../services/api'

type Mode = 'login' | 'register' | 'forgot'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')

  // Login fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Register fields
  const [regEmail, setRegEmail] = useState('')
  const [regFirstName, setRegFirstName] = useState('')
  const [regLastName, setRegLastName] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')

  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function switchMode(m: Mode) {
    setMode(m)
    setError('')
    setForgotSent(false)
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await api.login(email, password)
      login(user)
      if (user.mustChangePassword) {
        navigate('/change-password', { replace: true })
      } else {
        navigate(user.role === 'Manager' ? '/admin' : '/employee', { replace: true })
      }
    } catch {
      setError('Email o password non corretti.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (regPassword !== regConfirm) {
      setError('Le password non coincidono.')
      return
    }
    if (regPassword.length < 6) {
      setError('La password deve essere di almeno 6 caratteri.')
      return
    }
    setLoading(true)
    try {
      const user = await api.register(regEmail, regFirstName, regLastName, regPassword)
      login(user)
      navigate('/employee', { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Errore durante la registrazione.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleForgot(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.forgotPassword(forgotEmail)
      setForgotSent(true)
    } catch {
      setError('Errore durante la richiesta. Riprova più tardi.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Working Manager</h1>
        </div>

        {/* Tab toggle — hidden in forgot mode */}
        {mode !== 'forgot' && (
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'login'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Accedi
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'register'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Registrati
            </button>
          </div>
        )}

        {/* Login form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass} placeholder="mario@esempio.it" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass} placeholder="••••••••" />
            </div>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm px-3 py-2 rounded-lg border border-red-200 dark:border-red-700">{error}</div>
            )}
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Password dimenticata?
              </button>
            </div>
          </form>
        )}

        {/* Register form */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                <input type="text" required value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  className={inputClass} placeholder="Mario" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cognome</label>
                <input type="text" required value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  className={inputClass} placeholder="Rossi" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" required value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className={inputClass} placeholder="mario@esempio.it" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input type="password" required value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className={inputClass} placeholder="Min. 6 caratteri" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Conferma password</label>
              <input type="password" required value={regConfirm}
                onChange={(e) => setRegConfirm(e.target.value)}
                className={inputClass} placeholder="••••••••" />
            </div>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm px-3 py-2 rounded-lg border border-red-200 dark:border-red-700">{error}</div>
            )}
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              {loading ? 'Registrazione in corso...' : 'Crea account'}
            </button>
          </form>
        )}

        {/* Forgot password form */}
        {mode === 'forgot' && (
          <div>
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Torna al login
            </button>

            {forgotSent ? (
              <div className="text-center space-y-3">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Se l'indirizzo è registrato, riceverai un'email con la password temporanea.
                </p>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Torna al login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Password dimenticata</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Inserisci la tua email e ti invieremo una password temporanea.
                  </p>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input type="email" required value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className={inputClass} placeholder="mario@esempio.it" />
                </div>
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm px-3 py-2 rounded-lg border border-red-200 dark:border-red-700">{error}</div>
                )}
                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  {loading ? 'Invio in corso...' : 'Invia password temporanea'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
