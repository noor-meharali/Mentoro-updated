import React from 'react'

interface BadgeProps {
  text: string
}

const Badge: React.FC<BadgeProps> = ({ text }) => {
  return <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">{text}</span>
}

export default Badge
