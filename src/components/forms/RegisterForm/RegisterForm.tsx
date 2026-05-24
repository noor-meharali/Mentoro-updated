import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import Button from '../../common/Button/Button'

const RegisterForm: React.FC = () => {
  const location = useLocation()
  // FIX: Read the defaultRole hint passed from the "Get Ready" button via router state
  const locationState = location.state as { defaultRole?: 'teacher' | 'student' } | null
  const defaultRole = locationState?.defaultRole ?? 'student'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // FIX: role is now a first-class field, defaulting to what the landing page passed
  const [role, setRole] = useState<'teacher' | 'student'>(defaultRole)

  const { register, loading, error, clearError } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      // FIX: actually call register — creates user, logs them in, returns their profile
      const newUser = await register(name, email, password, role)
      // FIX: redirect to the correct dashboard based on the registered role
      navigate(`/${newUser.role}/dashboard`, { replace: true })
    } catch {
      // Error message is owned by AuthContext — displayed below
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-white/10 bg-slate-950/90 p-5 shadow-2xl shadow-slate-950/20 sm:space-y-6 sm:rounded-3xl sm:p-8"
    >
      <div>
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">Create your account</h2>
        <p className="mt-2 text-slate-400">Join Mentoro and start your learning experience.</p>
      </div>

      {/* FIX: Role selector — clearly separates teacher vs student registration */}
      <div>
        <p className="mb-2 text-sm text-slate-300">I am joining as a</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
              role === 'student'
                ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300'
                : 'border-white/10 text-slate-400 hover:bg-white/5'
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setRole('teacher')}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
              role === 'teacher'
                ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300'
                : 'border-white/10 text-slate-400 hover:bg-white/5'
            }`}
          >
            Teacher
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm text-slate-300">
          Full name
          <input
            type="text"
            value={name}
            onChange={(e) => { clearError(); setName(e.target.value) }}
            className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 sm:rounded-3xl"
            required
          />
        </label>
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
            minLength={6}
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

      <Button label={loading ? 'Creating account...' : 'Create account'} type="submit" disabled={loading} />

      <p className="text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-cyan-400 transition hover:text-cyan-300">
          Sign in
        </Link>
      </p>
    </form>
  )
}

export default RegisterForm
