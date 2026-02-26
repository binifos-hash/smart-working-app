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

  async function handleDelete(id: number) {
    setLoadingId(id)
    try {
      await api.deleteRequest(id)
      setRequests((prev) => prev.filter((r) => r.id !== id))
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Tabs — full width on mobile with icons, text on desktop */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
          {(['calendar', 'requests', 'employees'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {t === 'calendar' && (
                <>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden sm:inline">Calendario</span>
                  {pendingRequests.length > 0 && (
                    <span className="inline-flex items-center justify-center bg-yellow-400 text-yellow-900 text-[10px] font-bold w-4 h-4 rounded-full">
                      {pendingRequests.length}
                    </span>
                  )}
                </>
              )}
              {t === 'requests' && (
                <>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="hidden sm:inline">Tutte le richieste</span>
                </>
              )}
              {t === 'employees' && (
                <>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="hidden sm:inline">Dipendenti</span>
                </>
              )}
            </button>
          ))}
        </div>

        {/* Calendar tab */}
        {tab === 'calendar' && (
          <div className="space-y-6">
            <MonthCalendar requests={requests} showDayDetail />
            {pendingRequests.length > 0 && (
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">
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
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
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
                onDelete={handleDelete}
                loadingId={loadingId}
              />
            )}
          </div>
        )}

        {/* Employees tab */}
        {tab === 'employees' && (
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
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
              <>
                {/* Mobile: cards */}
                <div className="sm:hidden space-y-3">
                  {employees.map((emp) => (
                    <div key={emp.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {emp.firstName} {emp.lastName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{emp.email}</p>
                    </div>
                  ))}
                </div>
                {/* Desktop: table */}
                <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
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
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
