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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
          {(['calendar', 'requests'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'calendar' ? 'Calendario' : 'Le mie richieste'}
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Le mie richieste</h2>
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
