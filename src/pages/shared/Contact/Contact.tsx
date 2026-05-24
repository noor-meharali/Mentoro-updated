import React from 'react'

const Contact: React.FC = () => {
  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:rounded-[2rem] sm:p-8 lg:p-10">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/70 sm:text-sm sm:tracking-[0.35em]">Contact</p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-4xl">Talk to our team</h1>
        <p className="mt-5 text-base leading-7 text-slate-300 sm:mt-6">Reach out for enterprise deployment, partner onboarding, or product demos.</p>
        <div className="mt-8 space-y-4 text-slate-300">
          <p>Email: hello@mentoro.app</p>
          <p>Phone: +92-3295-482080</p>
          <p>Office: Ghauri VIP, Islamabad</p>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:rounded-[2rem] sm:p-8 lg:p-10">
        <form className="space-y-6">
          <label className="block text-sm text-slate-300">
            Name
            <input className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-cyan-400 sm:rounded-3xl" />
          </label>
          <label className="block text-sm text-slate-300">
            Email
            <input className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-cyan-400 sm:rounded-3xl" />
          </label>
          <label className="block text-sm text-slate-300">
            Message
            <textarea className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-cyan-400 sm:rounded-3xl" rows={5} />
          </label>
          <button className="min-h-11 w-full rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 sm:w-auto">
            Send message
          </button>
        </form>
      </div>
    </div>
  )
}

export default Contact
