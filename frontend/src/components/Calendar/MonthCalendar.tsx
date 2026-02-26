import { useState } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns'
import { it } from 'date-fns/locale'
import type { SmartWorkingRequest } from '../../types'

interface Props {
  requests: SmartWorkingRequest[]
  onDaySelect?: (date: Date) => void
  showAddButton?: boolean
  showDayDetail?: boolean
}

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-400',
  Approved: 'bg-green-500',
  Rejected: 'bg-red-400',
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

const weekDaysShort = ['L', 'M', 'M', 'G', 'V', 'S', 'D']
const weekDaysLong  = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

export default function MonthCalendar({
  requests,
  onDaySelect,
  showAddButton = false,
  showDayDetail = false,
}: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 })
  const end   = endOfWeek(endOfMonth(currentMonth),   { weekStartsOn: 1 })
  const days  = eachDayOfInterval({ start, end })

  function getRequestsForDay(day: Date): SmartWorkingRequest[] {
    return requests.filter((r) => isSameDay(new Date(r.date + 'T00:00:00'), day))
  }

  // For employee: check if day already has an active (non-rejected) request
  function dayIsAlreadyBooked(day: Date): boolean {
    return requests.some(
      (r) => isSameDay(new Date(r.date + 'T00:00:00'), day) && r.status !== 'Rejected'
    )
  }

  const selectedDayRequests = selectedDate ? getRequestsForDay(selectedDate) : []
  const selectedInMonth = selectedDate ? isSameMonth(selectedDate, currentMonth) : false

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: it })}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Grid */}
      <div className="p-2 sm:p-4">
        {/* Week day headers */}
        <div className="grid grid-cols-7 mb-1">
          {weekDaysShort.map((d, i) => (
            <div key={i} className="text-center py-1">
              <span className="sm:hidden text-xs font-medium text-gray-500 dark:text-gray-400">{d}</span>
              <span className="hidden sm:inline text-xs font-medium text-gray-500 dark:text-gray-400">{weekDaysLong[i]}</span>
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {days.map((day) => {
            const dayRequests = getRequestsForDay(day)
            const isSelected  = selectedDate && isSameDay(day, selectedDate)
            const inMonth     = isSameMonth(day, currentMonth)

            return (
              <div
                key={day.toISOString()}
                onClick={() => setSelectedDate(isSameDay(day, selectedDate ?? new Date(0)) ? null : day)}
                className={`
                  relative min-h-[44px] sm:min-h-[64px] p-0.5 sm:p-1 rounded-lg cursor-pointer transition-colors
                  ${inMonth ? 'hover:bg-gray-50 dark:hover:bg-gray-700' : 'opacity-30 pointer-events-none'}
                  ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30' : ''}
                `}
              >
                <span
                  className={`
                    inline-flex items-center justify-center w-6 h-6 text-xs sm:text-sm rounded-full
                    ${isToday(day) ? 'bg-blue-600 text-white font-bold' : 'text-gray-700 dark:text-gray-200'}
                  `}
                >
                  {format(day, 'd')}
                </span>

                <div className="mt-0.5 sm:mt-1">
                  {/* Mobile: colored dots */}
                  <div className="flex flex-wrap gap-0.5 sm:hidden">
                    {dayRequests.slice(0, 3).map((r) => (
                      <span key={r.id} className={`${STATUS_COLORS[r.status]} w-1.5 h-1.5 rounded-full block`} />
                    ))}
                    {dayRequests.length > 3 && (
                      <span className="text-[8px] text-gray-400 leading-none">+{dayRequests.length - 3}</span>
                    )}
                  </div>
                  {/* Desktop: name labels */}
                  <div className="hidden sm:flex flex-col gap-0.5">
                    {dayRequests.slice(0, 3).map((r) => (
                      <span
                        key={r.id}
                        className={`${STATUS_COLORS[r.status]} text-white text-[10px] rounded px-1 truncate`}
                        title={r.employeeName}
                      >
                        {r.employeeName.split(' ')[0]}
                      </span>
                    ))}
                    {dayRequests.length > 3 && (
                      <span className="text-[10px] text-gray-400">+{dayRequests.length - 3}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Admin: day detail panel ── */}
      {showDayDetail && selectedDate && selectedInMonth && (
        <div className="border-t border-gray-100 dark:border-gray-700">
          <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {format(selectedDate, 'EEEE d MMMM', { locale: it })}
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {selectedDayRequests.length === 0 ? (
            <p className="px-4 sm:px-6 pb-4 text-sm text-gray-400 dark:text-gray-500">
              Nessuna richiesta per questo giorno.
            </p>
          ) : (
            <ul className="px-4 sm:px-6 pb-4 space-y-2">
              {selectedDayRequests.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-semibold text-xs flex-shrink-0">
                      {r.employeeName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.employeeName}</p>
                      {r.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{r.description}</p>
                      )}
                    </div>
                  </div>
                  <span className={`flex-shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGE[r.status]}`}>
                    {STATUS_LABEL[r.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ── Employee: add button / already booked ── */}
      {showAddButton && selectedDate && selectedInMonth && (
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-700">
          {dayIsAlreadyBooked(selectedDate) ? (
            <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-4 py-3">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Hai già una richiesta per il{' '}
              <strong>{format(selectedDate, 'dd MMMM', { locale: it })}</strong>.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Selezionato: <strong>{format(selectedDate, 'dd MMMM yyyy', { locale: it })}</strong>
              </span>
              <button
                onClick={() => onDaySelect?.(selectedDate)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Aggiungi Smart Working
              </button>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="px-4 sm:px-6 py-3 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-3 sm:gap-4">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {status === 'Pending' ? 'In attesa' : status === 'Approved' ? 'Approvato' : 'Rifiutato'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
