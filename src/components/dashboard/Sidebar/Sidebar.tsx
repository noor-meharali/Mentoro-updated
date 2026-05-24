import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import styles from './Sidebar.module.css'

/* ── Nav item icons (inline SVG, no deps) ──── */
const Icons: Record<string, React.FC> = {
  Dashboard: () => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" width="18" height="18">
      <rect x="3" y="3" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="11" y="3" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="3" y="11" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="11" y="11" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  Courses: () => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" width="18" height="18">
      <path d="M4 6l6-3 6 3v5c0 3-6 6-6 6S4 14 4 11V6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
  'My courses': () => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" width="18" height="18">
      <rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 8h6M7 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Students: () => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" width="18" height="18">
      <circle cx="8" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 17c0-3 2.686-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M13 5a2.5 2.5 0 010 5M18 17c0-3-2-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Analytics: () => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" width="18" height="18">
      <path d="M3 14l4-5 4 3 4-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 17h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Notifications: () => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" width="18" height="18">
      <path d="M10 2a6 6 0 00-6 6v3.5l-1.5 2h15L16 11.5V8a6 6 0 00-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8.5 17a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" width="18" height="18">
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 2v1.5M10 16.5V18M2 10h1.5M16.5 10H18M4.22 4.22l1.06 1.06M14.72 14.72l1.06 1.06M4.22 15.78l1.06-1.06M14.72 5.28l1.06-1.06" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Progress: () => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" width="18" height="18">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 10l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
    </svg>
  ),
  Profile: () => (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" width="18" height="18">
      <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
}

const teacherSections = [
  { label: 'Dashboard',      path: '/teacher/dashboard' },
  { label: 'Courses',        path: '/teacher/courses' },
  { label: 'Students',       path: '/teacher/students' },
  { label: 'Analytics',      path: '/teacher/analytics' },
  { label: 'Notifications',  path: '/teacher/notifications' },
  { label: 'Settings',       path: '/teacher/settings' },
]

const studentSections = [
  { label: 'Dashboard',  path: '/student/dashboard' },
  { label: 'My courses', path: '/student/courses' },
  { label: 'Progress',   path: '/student/progress' },
  { label: 'Profile',    path: '/student/profile' },
]

/* Mentoro wordmark */
const MentoroLogo = () => (
  <svg viewBox="0 0 28 28" fill="none" aria-hidden="true" width="28" height="28">
    <rect width="28" height="28" rx="8" fill="url(#lg)" />
    <path d="M8 20V10l6 5 6-5v10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="lg" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#22d3ee"/>
        <stop offset="1" stopColor="#6366f1"/>
      </linearGradient>
    </defs>
  </svg>
)

interface SidebarProps {
  onNavigate?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const { user } = useAuth()
  const sections = user?.role === 'student' ? studentSections : teacherSections
  const workspaceLabel = user?.role === 'student' ? 'Student' : 'Teacher'

  return (
    <div className={styles.sidebar}>
      {/* ── Brand header ─────────────────────── */}
      <div className={styles.brand}>
        <MentoroLogo />
        <div className={styles.brandText}>
          <span className={styles.brandName}>Mentoro</span>
          <span className={styles.brandWorkspace}>{workspaceLabel} workspace</span>
        </div>
      </div>

      <div className={styles.divider} />

      {/* ── Navigation ───────────────────────── */}
      <nav className={styles.nav} aria-label="Dashboard navigation">
        <p className={styles.navLabel}>Navigation</p>
        <ul className={styles.navList}>
          {sections.map((item) => {
            const Icon = Icons[item.label]
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                  }
                >
                  {Icon && (
                    <span className={styles.navIcon}>
                      <Icon />
                    </span>
                  )}
                  <span className={styles.navItemLabel}>{item.label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* ── Footer hint ──────────────────────── */}
      <div className={styles.sidebarFooter}>
        <div className={styles.footerBadge}>
          <span className={styles.footerDot} />
          <span>Mentoro Studio v2</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
