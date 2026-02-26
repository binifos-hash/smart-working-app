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
}

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-400',
  Approved: 'bg-green-500',
  Rejected: 'bg-red-400',
}

export default function MonthCalendar({ requests, onDaySelect, showAddButton = false }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start, end })

  const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

  function getRequestsForDay(day: Date): SmartWorkingRequest[] {
    return requests.filter((r) => isSameDay(new Date(r.date + 'T00:00:00'), day))
  }

  function handleDayClick(day: Date) {
    setSelectedDate(day)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Grid */}
      <div className="p-4">
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayRequests = getRequestsForDay(day)
            const isSelected = selectedDate && isSameDay(day, selectedDate)
            const inMonth = isSameMonth(day, currentMonth)

            return (
              <div
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                className={`
                  relative min-h-[64px] p-1 rounded-lg cursor-pointer transition-colors
                  ${inMonth ? 'hover:bg-gray-50 dark:hover:bg-gray-700' : 'opacity-30'}
                  ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30' : ''}
                `}
              >
                <span
                  className={`
                    inline-flex items-center justify-center w-6 h-6 text-sm rounded-full
                    ${isToday(day) ? 'bg-blue-600 text-white font-bold' : 'text-gray-700 dark:text-gray-200'}
                  `}
                >
                  {format(day, 'd')}
                </span>
                <div className="mt-1 flex flex-col gap-0.5">
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
            )
          })}
        </div>
      </div>

      {/* Add button */}
      {showAddButton && selectedDate && isSameMonth(selectedDate, currentMonth) && (
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Selezionato: <strong>{format(selectedDate, 'dd MMMM yyyy', { locale: it })}</strong>
          </span>
          <button
            onClick={() => onDaySelect?.(selectedDate)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Aggiungi Smart Working
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-4">
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
