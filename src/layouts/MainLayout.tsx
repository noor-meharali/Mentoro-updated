import React, { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import Footer from '../components/common/Footer/Footer'

const MainLayout: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const closeMenu = () => setMenuOpen(false)

  /* Close menu on route change */
  useEffect(() => { closeMenu() }, [location.pathname])

  /* Detect scroll for header shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ minHeight: '100vh', overflowX: 'clip' }}>
      {/* ── Header ───────────────────────────── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: scrolled ? 'var(--m-surface-strong)' : 'transparent',
        borderBottom: `1px solid ${scrolled ? 'var(--m-border)' : 'transparent'}`,
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
        transition: 'background 250ms var(--m-ease), border-color 250ms var(--m-ease), box-shadow 250ms var(--m-ease)',
        boxShadow: scrolled ? 'var(--m-shadow-sm)' : 'none',
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '1rem 1.25rem',
        }}>
          {/* Logo */}
          <Link
            to="/"
            onClick={closeMenu}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--m-accent)',
              letterSpacing: '-0.01em',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 28 28" fill="none" width="26" height="26" aria-hidden="true">
              <rect width="28" height="28" rx="7" fill="url(#lg2)" />
              <path d="M8 20V10l6 5 6-5v10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="lg2" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#22d3ee"/>
                  <stop offset="1" stopColor="#6366f1"/>
                </linearGradient>
              </defs>
            </svg>
            Mentoro
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              width: '2.5rem',
              height: '2.5rem',
              flexShrink: 0,
              borderRadius: 'var(--m-r-md)',
              border: '1px solid var(--m-border)',
              background: 'var(--m-surface-hover)',
              color: 'var(--m-text)',
              cursor: 'pointer',
            }}
            className="md-hidden"
          >
            <span className="sr-only">Toggle navigation</span>
            <span style={{ display: 'block', width: '1rem', height: '1.5px', borderRadius: '9999px', background: 'currentColor' }} />
            <span style={{ display: 'block', width: '1rem', height: '1.5px', borderRadius: '9999px', background: 'currentColor' }} />
            <span style={{ display: 'block', width: '1rem', height: '1.5px', borderRadius: '9999px', background: 'currentColor' }} />
          </button>

          {/* Desktop nav */}
          <nav
            id="main-navigation"
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.875rem',
              color: 'var(--m-text)',
            }}
            className="desktop-nav"
          >
            {[
              { to: '/about', label: 'About' },
              { to: '/contact', label: 'Contact' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  padding: '0.5rem 0.875rem',
                  borderRadius: 'var(--m-r-md)',
                  fontWeight: 500,
                  color: 'var(--m-text)',
                  transition: 'all var(--m-duration) var(--m-ease)',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </Link>
            ))}
            <div style={{ width: '1px', height: '1.25rem', background: 'var(--m-border)', margin: '0 0.25rem' }} />
            <Link
              to="/login"
              style={{
                padding: '0.5rem 1.125rem',
                borderRadius: '9999px',
                border: '1px solid var(--m-border-accent)',
                color: 'var(--m-accent-text)',
                fontWeight: 600,
                fontSize: '0.875rem',
                textDecoration: 'none',
                transition: 'all var(--m-duration) var(--m-ease)',
              }}
            >
              Login
            </Link>
          </nav>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav
            style={{
              borderTop: '1px solid var(--m-border)',
              padding: '0.75rem 1.25rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
            }}
          >
            {[
              { to: '/about', label: 'About' },
              { to: '/contact', label: 'Contact' },
            ].map((link) => (
              <Link
                key={link.to}
                onClick={closeMenu}
                to={link.to}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--m-r-md)',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: 'var(--m-text)',
                  textDecoration: 'none',
                  transition: 'background var(--m-duration) var(--m-ease)',
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              onClick={closeMenu}
              to="/login"
              style={{
                marginTop: '0.25rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--m-r-md)',
                border: '1px solid var(--m-border-accent)',
                textAlign: 'center',
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: 'var(--m-accent-text)',
                textDecoration: 'none',
              }}
            >
              Login
            </Link>
          </nav>
        )}
      </header>

      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1.25rem', width: '100%' }}>
        <Outlet />
      </main>

      <Footer />

      {/* Inline responsive CSS for MainLayout */}
      <style>{`
        @media (min-width: 768px) {
          .md-hidden { display: none !important; }
          .desktop-nav { display: flex !important; }
        }
      `}</style>
    </div>
  )
}

export default MainLayout
