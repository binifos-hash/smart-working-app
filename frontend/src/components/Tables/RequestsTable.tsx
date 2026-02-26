import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import type { SmartWorkingRequest } from '../../types'

interface Props {
  requests: SmartWorkingRequest[]
  showEmployee?: boolean
  onApprove?: (id: number) => void
  onReject?: (id: number) => void
  onDelete?: (id: number) => void
  loadingId?: number | null
}

const STATUS_BADGE: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
  Approved: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  Rejected: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
}

const STATUS_LABEL: Record<string, string> = {
  Pending: 'In attesa',
  Approved: 'Approvata',
  Rejected: 'Rifiutata',
}

export default function RequestsTable({
  requests,
  showEmployee = false,
  onApprove,
  onReject,
  onDelete,
  loadingId,
}: Props) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Nessuna richiesta trovata.
      </div>
    )
  }

  const hasActions = !!(onApprove || onReject || onDelete)

  return (
    <>
      {/* ── Mobile: card list ── */}
      <div className="sm:hidden space-y-3">
        {requests.map((r) => (
          <div key={r.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                {showEmployee && (
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {r.employeeName}
                  </p>
                )}
                <p className={`font-semibold text-gray-900 dark:text-white ${showEmployee ? 'text-sm' : 'text-base'}`}>
                  {format(new Date(r.date + 'T00:00:00'), 'dd MMMM yyyy', { locale: it })}
                </p>
              </div>
              <span className={`inline-flex flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGE[r.status]}`}>
                {STATUS_LABEL[r.status]}
              </span>
            </div>

            {r.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                {r.description}
              </p>
            )}

            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-gray-400">
                {format(new Date(r.createdAt), 'dd/MM/yyyy HH:mm')}
              </span>
              <div className="flex gap-2">
                {r.status === 'Pending' && (
                  <>
                    {onApprove && (
                      <button
                        onClick={() => onApprove(r.id)}
                        disabled={loadingId === r.id}
                        className="bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Approva
                      </button>
                    )}
                    {onReject && (
                      <button
                        onClick={() => onReject(r.id)}
                        disabled={loadingId === r.id}
                        className="bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Rifiuta
                      </button>
                    )}
                  </>
                )}
                {r.status !== 'Pending' && onDelete && (
                  <button
                    onClick={() => onDelete(r.id)}
                    disabled={loadingId === r.id}
                    title="Elimina"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop: table ── */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              {showEmployee && (
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Dipendente</th>
              )}
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Data</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Descrizione</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Stato</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Richiesta il</th>
              {hasActions && (
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Azioni</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {requests.map((r) => (
              <tr key={r.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                {showEmployee && (
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white">{r.employeeName}</div>
                    <div className="text-xs text-gray-400">{r.employeeEmail}</div>
                  </td>
                )}
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                  {format(new Date(r.date + 'T00:00:00'), 'dd MMM yyyy', { locale: it })}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-[200px]">
                  <span className="truncate block" title={r.description ?? ''}>
                    {r.description ?? <span className="italic text-gray-300 dark:text-gray-600">—</span>}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGE[r.status]}`}>
                    {STATUS_LABEL[r.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {format(new Date(r.createdAt), 'dd/MM/yyyy HH:mm')}
                </td>
                {hasActions && (
                  <td className="px-4 py-3">
                    {r.status === 'Pending' ? (
                      <div className="flex gap-2">
                        {onApprove && (
                          <button
                            onClick={() => onApprove(r.id)}
                            disabled={loadingId === r.id}
                            className="bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          >
                            Approva
                          </button>
                        )}
                        {onReject && (
                          <button
                            onClick={() => onReject(r.id)}
                            disabled={loadingId === r.id}
                            className="bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          >
                            Rifiuta
                          </button>
                        )}
                      </div>
                    ) : onDelete ? (
                      <button
                        onClick={() => onDelete(r.id)}
                        disabled={loadingId === r.id}
                        title="Elimina"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
