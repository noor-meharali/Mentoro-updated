import React from 'react'
import { useTheme } from '../../../hooks/useTheme'

const SunIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" width="16" height="16">
    <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 2v1.5M10 16.5V18M2 10h1.5M16.5 10H18M4.22 4.22l1.06 1.06M14.72 14.72l1.06 1.06M4.22 15.78l1.06-1.06M14.72 5.28l1.06-1.06"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const MoonIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" width="16" height="16">
    <path d="M17 11.5A7.5 7.5 0 118.5 3a5.5 5.5 0 108.5 8.5z"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="theme-toggle"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.4rem',
        minHeight: '2.5rem',
        padding: '0.4rem 0.75rem',
        borderRadius: 'var(--m-r-pill)',
        border: '1px solid var(--m-border)',
        background: 'var(--m-surface-hover)',
        color: 'var(--m-text)',
        fontSize: '0.75rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all var(--m-duration) var(--m-ease)',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
      // FIX #2: hover handlers were setting the SAME value on enter and leave —
      // now enter raises the surface, leave restores the base.
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.background = 'var(--m-surface-active)'
        el.style.borderColor = 'var(--m-border-strong)'
        el.style.color = 'var(--m-text-strong)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.background = 'var(--m-surface-hover)'
        el.style.borderColor = 'var(--m-border)'
        el.style.color = 'var(--m-text)'
      }}
    >
      {isDark ? <MoonIcon /> : <SunIcon />}
      {/* FIX #3: .sm-inline was undefined — label was always hidden.
          Use Tailwind responsive utilities so the label appears on sm+ screens. */}
      <span className="hidden sm:inline">{isDark ? 'Night' : 'Light'}</span>
    </button>
  )
}

export default ThemeToggle
