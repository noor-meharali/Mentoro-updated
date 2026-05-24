import React from 'react'
import { Link } from 'react-router-dom'

const Home: React.FC = () => {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)] lg:gap-10 xl:gap-16">
      <section className="min-w-0 space-y-6 sm:space-y-8">
        {/* Teacher CTA card */}
        <div className="max-w-2xl rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:rounded-[2rem] sm:p-8 lg:p-10">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/70 sm:text-sm sm:tracking-[0.35em]">
            For educators
          </p>
          <h1 className="mt-5 text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
            Transform learning into a premium campus experience.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:mt-6 sm:text-lg">
            Deliver adaptive courses, coach students, and measure outcomes with an analytics-first
            SaaS workflow designed for education teams.
          </p>
          <div className="mt-8 grid gap-3 xs:grid-cols-2 sm:flex sm:flex-wrap sm:gap-4">
            {/* FIX: Teacher login — labelled explicitly */}
            <Link
              to="/login"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Teacher login
            </Link>
            <Link
              to="/about"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm text-slate-200 transition hover:bg-white/5"
            >
              Learn more
            </Link>
          </div>
        </div>

        {/* FIX: Student CTA card — "Get Ready" now exists and goes to /register */}
        <div className="max-w-2xl rounded-2xl border border-emerald-500/20 bg-emerald-950/40 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:rounded-[2rem] sm:p-8 lg:p-10">
          <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/70 sm:text-sm sm:tracking-[0.35em]">
            For students
          </p>
          <h2 className="mt-4 text-2xl font-semibold leading-tight text-white sm:text-3xl">
            Start your learning journey today.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
            Watch video lectures, download course materials, and track your progress — all in one
            place.
          </p>
          <div className="mt-6 grid gap-3 xs:grid-cols-2 sm:flex sm:flex-wrap sm:gap-4">
            {/* THE "Get Ready" button — now correctly routes to /register with student intent */}
            <Link
              to="/register"
              state={{ defaultRole: 'student' }}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Get Ready
            </Link>
            <Link
              to="/login"
              state={{ defaultRole: 'student' }}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-emerald-500/30 px-6 py-3 text-sm text-emerald-200 transition hover:bg-emerald-500/10"
            >
              Student login
            </Link>
          </div>
        </div>
      </section>

      <section className="grid min-w-0 gap-5 sm:gap-6">
        <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-2xl shadow-slate-950/25 backdrop-blur-xl sm:rounded-[2rem] sm:p-8">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/70 sm:text-sm sm:tracking-[0.35em]">
            Snapshot
          </p>
          <div className="mt-6 grid gap-5">
            <div className="rounded-2xl bg-slate-900/70 p-5 sm:rounded-3xl">
              <p className="text-sm text-slate-400">Active students</p>
              <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">1.2K</h2>
            </div>
            <div className="rounded-2xl bg-slate-900/70 p-5 sm:rounded-3xl">
              <p className="text-sm text-slate-400">Monthly course launches</p>
              <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">16</h2>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-2xl shadow-slate-950/25 backdrop-blur-xl sm:rounded-[2rem] sm:p-8">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/70 sm:text-sm sm:tracking-[0.35em]">
            Why Mentoro
          </p>
          <ul className="mt-6 list-disc space-y-4 pl-5 text-slate-300">
            <li>Adaptive learning dashboards for every user</li>
            <li>Premium analytics with live progress tracking</li>
            <li>Modern course authoring and student pipelines</li>
          </ul>
        </div>
      </section>
    </div>
  )
}

export default Home
