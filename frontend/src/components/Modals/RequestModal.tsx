import { useState, type FormEvent } from 'react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface Props {
  selectedDate: Date
  onConfirm: (date: string, description?: string) => Promise<void>
  onClose: () => void
}

export default function RequestModal({ selectedDate, onConfirm, onClose }: Props) {
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      await onConfirm(dateStr, description || undefined)
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Errore durante la creazione della richiesta.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Nuova richiesta Smart Working</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data selezionata</label>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-blue-800 font-medium">
              {format(selectedDate, "EEEE d MMMM yyyy", { locale: it })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrizione <span className="text-gray-400 font-normal">(opzionale)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Aggiungi una nota per il tuo gestore..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/500</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Invio...' : 'Invia richiesta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
