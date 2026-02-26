import { useEffect, useState } from 'react'
import Navbar from '../components/Layout/Navbar'
import MonthCalendar from '../components/Calendar/MonthCalendar'
import RequestsTable from '../components/Tables/RequestsTable'
import * as api from '../services/api'
import type { SmartWorkingRequest, Employee } from '../types'

type Tab = 'calendar' | 'requests' | 'employees'

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('calendar')
  const [requests, setRequests] = useState<SmartWorkingRequest[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingId, setLoadingId] = useState<number | null>(null)

  const pendingRequests = requests.filter((r) => r.status === 'Pending')

  async function loadData() {
    setLoading(true)
    try {
      const [reqs, emps] = await Promise.all([api.getAllRequests(), api.getEmployees()])
      setRequests(reqs)
      setEmployees(emps)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleStatus(id: number, status: 'Approved' | 'Rejected') {
    setLoadingId(id)
    try {
      const updated = await api.updateRequestStatus(id, status)
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    } finally {
      setLoadingId(null)
    }
  }

  const TAB_LABELS: Record<Tab, string> = {
    calendar: 'Calendario',
    requests: 'Tutte le richieste',
    employees: 'Dipendenti',
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6 w-fit">
          {(['calendar', 'requests', 'employees'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {TAB_LABELS[t]}
              {t === 'calendar' && pendingRequests.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center bg-yellow-400 text-yellow-900 text-xs font-bold w-5 h-5 rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Calendar tab */}
        {tab === 'calendar' && (
          <div className="space-y-6">
            <MonthCalendar requests={requests} />
            {pendingRequests.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Richieste in attesa
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    ({pendingRequests.length})
                  </span>
                </h2>
                <RequestsTable
                  requests={pendingRequests}
                  showEmployee
                  onApprove={(id) => handleStatus(id, 'Approved')}
                  onReject={(id) => handleStatus(id, 'Rejected')}
                  loadingId={loadingId}
                />
              </div>
            )}
            {pendingRequests.length === 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6 text-center text-green-700 dark:text-green-400">
                Nessuna richiesta in attesa di approvazione.
              </div>
            )}
          </div>
        )}

        {/* All requests tab */}
        {tab === 'requests' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tutte le richieste
              <span className="ml-2 text-sm font-normal text-gray-400">({requests.length})</span>
            </h2>
            {loading ? (
              <div className="text-center py-12 text-gray-400">Caricamento...</div>
            ) : (
              <RequestsTable
                requests={requests}
                showEmployee
                onApprove={(id) => handleStatus(id, 'Approved')}
                onReject={(id) => handleStatus(id, 'Rejected')}
                loadingId={loadingId}
              />
            )}
          </div>
        )}

        {/* Employees tab */}
        {tab === 'employees' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Dipendenti
              <span className="ml-2 text-sm font-normal text-gray-400">({employees.length})</span>
            </h2>
            {loading ? (
              <div className="text-center py-12 text-gray-400">Caricamento...</div>
            ) : employees.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                Nessun dipendente assegnato.
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Nome</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Cognome</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{emp.firstName}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{emp.lastName}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{emp.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
