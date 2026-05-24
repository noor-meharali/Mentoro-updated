import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import ThemeToggle from '../ThemeToggle/ThemeToggle'
import styles from './Navbar.module.css'

interface NavbarProps {
  onMenuClick?: () => void
}

/** Returns initials from a full name string */
const getInitials = (name?: string) =>
  name
    ? name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : '?'

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const profilePath = user?.role === 'student' ? '/student/profile' : '/teacher/settings'
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* Close dropdown on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <header className={styles.navbar}>
      {/* ── Left: hamburger + page title ─────── */}
      <div className={styles.left}>
        {/* Hamburger — visible on mobile only */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className={styles.hamburger}
        >
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
        </button>

        {/* Page heading */}
        <div className={styles.pageTitle}>
          <span className={styles.pageTitleLabel}>Dashboard</span>
          <span className={styles.pageTitleHeading}>Learning operations</span>
        </div>
      </div>

      {/* ── Right: theme toggle + user ───────── */}
      <div className={styles.right}>
        <ThemeToggle />

        {/* User avatar + dropdown trigger */}
        <div className={styles.userMenu} ref={dropdownRef}>
          <button
            type="button"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            onClick={() => setDropdownOpen((v) => !v)}
            className={styles.avatarBtn}
          >
            <span className={styles.avatarRing}>
              <span className={styles.avatarInitials}>
                {getInitials(user?.name)}
              </span>
            </span>
            <span className={styles.avatarName}>{user?.name ?? 'Account'}</span>
            <svg
              className={`${styles.chevron} ${dropdownOpen ? styles.chevronOpen : ''}`}
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Dropdown panel */}
          {dropdownOpen && (
            <div className={styles.dropdown} role="menu">
              {/* User identity row */}
              <div className={styles.dropdownHeader}>
                <span className={styles.dropdownAvatar}>
                  {getInitials(user?.name)}
                </span>
                <div className={styles.dropdownUserInfo}>
                  <span className={styles.dropdownName}>{user?.name}</span>
                  <span className={styles.dropdownRole}>{user?.role ?? 'Member'}</span>
                </div>
              </div>

              <div className={styles.dropdownDivider} />

              <Link
                to={profilePath}
                onClick={() => setDropdownOpen(false)}
                className={styles.dropdownItem}
                role="menuitem"
              >
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={styles.dropdownIcon}>
                  <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Profile &amp; Settings
              </Link>

              <div className={styles.dropdownDivider} />

              <button
                type="button"
                onClick={() => { setDropdownOpen(false); logout() }}
                className={`${styles.dropdownItem} ${styles.dropdownSignOut}`}
                role="menuitem"
              >
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={styles.dropdownIcon}>
                  <path d="M13 15l4-5m0 0l-4-5m4 5H7m6 8H5a2 2 0 01-2-2V4a2 2 0 012-2h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
