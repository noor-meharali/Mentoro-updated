import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

// FIX #4: removed hardcoded dark Tailwind classes (text-slate-300, bg-slate-950/80,
// text-white, border-white/10). Now driven by design tokens so light mode works.
const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <label
      className="block text-sm"
      style={{ color: 'var(--m-text)' }}
    >
      {label}
      <input
        {...props}
        className={`mt-2 min-h-11 w-full px-4 py-3 outline-none transition ${className}`}
        style={{
          background: 'var(--m-surface-hover)',
          border: '1px solid var(--m-border)',
          color: 'var(--m-text-strong)',
          borderRadius: 'var(--m-r-md)',
        }}
      />
    </label>
  )
}

export default Input
