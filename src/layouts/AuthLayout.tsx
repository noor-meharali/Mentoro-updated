import React from 'react'
import { Link, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// FIX #5: replaced hardcoded `bg-slate-950 text-slate-100 border-white/10 bg-white/5`
// with design tokens so the auth shell themes correctly in both modes.
const AuthLayout: React.FC = () => {
  const { user } = useAuth()

  if (user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />
  }

  return (
    <div
      className="min-h-screen overflow-x-clip px-4 py-5 sm:px-6 sm:py-8"
      style={{ background: 'var(--m-bg)', color: 'var(--m-text-strong)' }}
    >
      <div className="mx-auto mb-5 flex w-full max-w-5xl items-center justify-between gap-4 sm:mb-6">
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight sm:text-xl"
          style={{ color: 'var(--m-accent-text)' }}
        >
          Mentoro Studio
        </Link>
        <Link
          to="/"
          className="shrink-0 px-3 py-2 text-sm transition sm:px-4"
          style={{
            border: '1px solid var(--m-border)',
            background: 'transparent',
            color: 'var(--m-text)',
            borderRadius: 'var(--m-r-md)',
          }}
        >
          Back home
        </Link>
      </div>
      <div
        className="mx-auto w-full max-w-5xl p-3 backdrop-blur-xl sm:p-6 lg:p-8"
        style={{
          border: '1px solid var(--m-border)',
          background: 'var(--m-surface)',
          borderRadius: 'var(--m-r-xl)',
          boxShadow: 'var(--m-shadow-lg)',
        }}
      >
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
