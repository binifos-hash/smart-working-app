import { useEffect, useState } from 'react'
import Navbar from '../components/Layout/Navbar'
import MonthCalendar from '../components/Calendar/MonthCalendar'
import RequestModal from '../components/Modals/RequestModal'
import RequestsTable from '../components/Tables/RequestsTable'
import * as api from '../services/api'
import type { SmartWorkingRequest } from '../types'

type Tab = 'calendar' | 'requests'

export default function EmployeePage() {
  const [tab, setTab] = useState<Tab>('calendar')
  const [requests, setRequests] = useState<SmartWorkingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [modalDate, setModalDate] = useState<Date | null>(null)

  async function loadRequests() {
    setLoading(true)
    try {
      const data = await api.getMyRequests()
      setRequests(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  async function handleCreateRequest(dateStr: string, description?: string) {
    await api.createRequest(dateStr, description)
    await loadRequests()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
          {(['calendar', 'requests'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {t === 'calendar' ? (
                <>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden sm:inline">Calendario</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="hidden sm:inline">Le mie richieste</span>
                </>
              )}
            </button>
          ))}
        </div>

        {tab === 'calendar' && (
          <div>
            <MonthCalendar
              requests={requests}
              showAddButton
              onDaySelect={(date) => setModalDate(date)}
            />
          </div>
        )}

        {tab === 'requests' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Le mie richieste</h2>
            {loading ? (
              <div className="text-center py-12 text-gray-400">Caricamento...</div>
            ) : (
              <RequestsTable requests={requests} showEmployee={false} />
            )}
          </div>
        )}
      </div>

      {modalDate && (
        <RequestModal
          selectedDate={modalDate}
          onConfirm={handleCreateRequest}
          onClose={() => setModalDate(null)}
        />
      )}
    </div>
  )
}
