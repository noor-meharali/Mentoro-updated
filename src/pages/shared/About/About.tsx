import React from 'react'

const About: React.FC = () => {
  return (
    <div className="space-y-6 sm:space-y-10">
      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:rounded-[2rem] sm:p-8 lg:p-10">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/70 sm:text-sm sm:tracking-[0.35em]">About Mentoro</p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-4xl">A next-generation learning suite for high-growth teams.</h1>
        <p className="mt-5 text-base leading-7 text-slate-300 sm:mt-6">
          Mentoro brings course delivery, student engagement, and analytics into a single unified platform built for instructors and learners.
        </p>
      </div>
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {['Intelligent workflows', 'User-first design', 'Scalable enterprise'].map((label) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/70 p-5 text-slate-300 shadow-xl shadow-slate-950/20 sm:rounded-3xl sm:p-8">
            <h2 className="text-xl font-semibold text-white">{label}</h2>
            <p className="mt-3 text-sm leading-7">Premium infrastructure, elegant design, and secure scaling for education operations.</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default About
