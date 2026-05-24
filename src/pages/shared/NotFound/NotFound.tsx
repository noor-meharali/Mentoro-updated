import React from 'react'
import { Link } from 'react-router-dom'

const NotFound: React.FC = () => {
  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-slate-950/80 p-6 text-center shadow-2xl shadow-slate-950/25 backdrop-blur-xl sm:rounded-[2rem] sm:p-10 lg:p-16">
      <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/70 sm:text-sm sm:tracking-[0.35em]">404 error</p>
      <h1 className="mt-6 text-3xl font-semibold text-white sm:text-5xl">Page not found</h1>
      <p className="mt-4 text-slate-400">The route you are looking for has either moved or does not exist.</p>
      <Link to="/" className="mt-8 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 sm:w-auto">
        Back to home
      </Link>
    </div>
  )
}

export default NotFound
