import React from 'react'
import { useNotificationContext } from '../../../hooks/useNotifications'

const TeacherNotifications: React.FC = () => {
  const { notifications, markAsRead } = useNotificationContext()

  return (
    <div className="min-w-0 space-y-5 sm:space-y-8">
      <div className="rounded-2xl border border-white/10 bg-slate-950/85 p-5 shadow-2xl shadow-slate-950/20 sm:rounded-3xl sm:p-8">
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">Alerts and messages</h2>
        <p className="mt-3 text-slate-400">Recent updates for your teaching experience, system health, and course activity.</p>
      </div>
      <div className="grid gap-4">
        {notifications.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-lg shadow-slate-950/20 sm:rounded-3xl sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm text-slate-400">{item.description}</p>
              </div>
              <button
                onClick={() => markAsRead(item.id)}
                className="min-h-11 w-full rounded-full border border-white/10 px-4 py-2 text-sm text-cyan-200 transition hover:bg-white/5 sm:w-auto sm:shrink-0"
              >
                Mark read
              </button>
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-500">{item.time}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TeacherNotifications
