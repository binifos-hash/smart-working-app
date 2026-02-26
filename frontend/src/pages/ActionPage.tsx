import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import * as api from '../services/api'

type State = 'loading' | 'success' | 'error'

export default function ActionPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const action = searchParams.get('action') ?? ''
  const [state, setState] = useState<State>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token || (action !== 'approve' && action !== 'reject')) {
      setState('error')
      setMessage('Parametri non validi.')
      return
    }

    api
      .handleEmailAction(token, action)
      .then((res) => {
        setState('success')
        setMessage(res.message)
      })
      .catch(() => {
        setState('error')
        setMessage('Token non valido, scaduto o richiesta già elaborata.')
      })
  }, [token, action])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        {state === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Elaborazione in corso...</p>
          </>
        )}
        {state === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Operazione completata</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
            <Link
              to="/admin"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Vai al pannello
            </Link>
          </>
        )}
        {state === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Errore</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Torna al login
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
