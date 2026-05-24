import React from 'react'

// FIX #5: dropped hardcoded `border-white/10 bg-slate-950/90 text-slate-500`.
// Footer now uses tokens and adapts to light/dark theme automatically.
const Footer: React.FC = () => {
  return (
    <footer
      className="px-4 py-6 text-sm sm:px-6 lg:px-8"
      style={{
        borderTop: '1px solid var(--m-border)',
        background: 'var(--m-surface-strong)',
        color: 'var(--m-text-muted)',
      }}
    >
      <div className="mx-auto w-full max-w-7xl">
        (c) 2026 Mentoro. Crafted for modern enterprise learning teams.
      </div>
    </footer>
  )
}

export default Footer
