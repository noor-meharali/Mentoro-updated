import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import Button from '../../common/Button/Button'

const LoginForm: React.FC = () => {
  // FIX: No more hardcoded teacher@mentoro.app defaults — blank fields for both roles
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // FIX: Read the role hint passed from the landing page so we can show contextual UI
  const locationState = location.state as { from?: { pathname?: string }; defaultRole?: string } | null
  const isStudentFlow = locationState?.defaultRole === 'student'

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      const authenticated = await login(email, password)
      // FIX: redirect to the role-specific dashboard based on what the API returns
      const from = locationState?.from?.pathname
      navigate(from ?? `/${authenticated.role}/dashboard`, { replace: true })
    } catch {
      // Error message is owned by AuthContext
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-white/10 bg-slate-950/90 p-5 shadow-2xl shadow-slate-950/20 sm:space-y-6 sm:rounded-3xl sm:p-8"
    >
      <div>
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">
          {isStudentFlow ? 'Welcome back, student' : 'Welcome back'}
        </h2>
        <p className="mt-2 text-slate-400">Sign in to access your Mentoro workspace.</p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm text-slate-300">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => { clearError(); setEmail(e.target.value) }}
            className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 sm:rounded-3xl"
            required
          />
        </label>
        <label className="block text-sm text-slate-300">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => { clearError(); setPassword(e.target.value) }}
            className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 sm:rounded-3xl"
            required
          />
        </label>
      </div>

      {error && (
        <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </p>
      )}

      <Button label={loading ? 'Signing in...' : 'Sign in'} type="submit" disabled={loading} />

      {/* FIX: Link to register so students can create accounts from the login page too */}
      <p className="text-center text-sm text-slate-400">
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          state={{ defaultRole: locationState?.defaultRole ?? 'student' }}
          className="text-cyan-400 transition hover:text-cyan-300"
        >
          Create one
        </Link>
      </p>
    </form>
  )
}

export default LoginForm
