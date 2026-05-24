import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCourses } from '../../../hooks/useCourses'
import { useAuth } from '../../../hooks/useAuth'
import { useProgressOverview } from '../../../hooks/useProgressTracking'

const StudentDashboard: React.FC = () => {
  const { user } = useAuth()
  const { studentCourses, loading, error, loadStudentCourses } = useCourses()
  const progress = useProgressOverview(studentCourses)

  useEffect(() => {
    loadStudentCourses()
  }, [loadStudentCourses])

  const totalDocs = studentCourses.reduce((s, c) => s + c.documents.length, 0)
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  const stats = [
    {
      label: 'Available courses',
      value: studentCourses.length,
      icon: (
        <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
          <rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M7 8h6M7 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      color: 'var(--m-accent)',
    },
    {
      label: 'Overall progress',
      value: `${progress.overallPercent}%`,
      icon: (
        <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
          <path d="M3 14l4-5 4 3 4-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 17h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      color: '#34d399',
    },
    {
      label: 'Documents',
      value: totalDocs,
      icon: (
        <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
          <path d="M5 4h7l3 3v9a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M12 4v3h3M7 9h6M7 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      color: '#a78bfa',
    },
  ]

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
      {/* ── Welcome header ──────────────────────── */}
      <div style={{
        borderRadius: 'var(--m-r-xl)',
        border: '1px solid var(--m-border)',
        background: 'var(--m-surface-card)',
        backdropFilter: 'blur(20px)',
        padding: '1.5rem',
        boxShadow: 'var(--m-shadow-md)',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--m-accent-text)', opacity: 0.8, margin: 0 }}>
              Student dashboard
            </p>
            <h2 style={{ marginTop: '0.5rem', fontSize: 'clamp(1.35rem, 3vw, 1.75rem)', fontWeight: 700, color: 'var(--m-text-strong)', margin: '0.5rem 0 0' }}>
              Welcome back, {firstName} 👋
            </h2>
            <p style={{ marginTop: '0.375rem', fontSize: '0.875rem', color: 'var(--m-text-muted)', margin: '0.375rem 0 0' }}>
              Pick up where you left off and keep the streak going.
            </p>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '0.25rem',
            background: 'var(--m-surface-hover)',
            border: '1px solid var(--m-border)',
            borderRadius: 'var(--m-r-lg)',
            padding: '0.875rem 1.125rem',
            flexShrink: 0,
          }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--m-text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Learning streak</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--m-text-strong)', margin: 0 }}>
              {progress.streakDays} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--m-text-muted)' }}>days</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats grid ──────────────────────────── */}
      <div style={{ display: 'grid', gap: '0.875rem', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`stagger-${i + 1}`}
            style={{
              borderRadius: 'var(--m-r-lg)',
              border: '1px solid var(--m-border)',
              background: 'var(--m-surface-card)',
              backdropFilter: 'blur(16px)',
              padding: '1.125rem',
              boxShadow: 'var(--m-shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--m-text-muted)', margin: 0 }}>
                {stat.label}
              </p>
              <span style={{ color: stat.color, opacity: 0.8 }}>{stat.icon}</span>
            </div>
            <p style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--m-text-strong)', margin: 0, lineHeight: 1 }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Error / loading states ───────────────── */}
      {error && (
        <div style={{ borderRadius: 'var(--m-r-md)', border: '1px solid rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.08)', padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--m-danger)' }}>
          {error}
        </div>
      )}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1,2,3].map((i) => (
            <div key={i} className="skeleton" style={{ height: '5.5rem', borderRadius: 'var(--m-r-lg)' }} />
          ))}
        </div>
      )}

      {/* ── Course cards ────────────────────────── */}
      {!loading && studentCourses.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--m-text-strong)', margin: 0 }}>Your courses</h3>
            <Link
              to="/student/courses"
              style={{ fontSize: '0.8125rem', color: 'var(--m-accent-text)', fontWeight: 500, opacity: 0.85 }}
            >
              View all →
            </Link>
          </div>
          <div style={{ display: 'grid', gap: '0.875rem', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {studentCourses.map((course) => {
              const summary = progress.summaries.find((item) => item.courseId === course.id)
              const percent = summary?.percent ?? course.progress
              return (
                <div
                  key={course.id}
                  className="hover-lift"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 'var(--m-r-xl)',
                    border: '1px solid var(--m-border)',
                    background: 'var(--m-surface-card)',
                    backdropFilter: 'blur(16px)',
                    padding: '1.25rem',
                    boxShadow: 'var(--m-shadow-sm)',
                  }}
                >
                  <span style={{
                    alignSelf: 'flex-start',
                    borderRadius: '9999px',
                    background: 'var(--m-accent-soft)',
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--m-accent-text)',
                  }}>
                    {course.category}
                  </span>
                  <h3 style={{ marginTop: '0.875rem', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--m-text-strong)', lineHeight: 1.35 }}>
                    {course.title}
                  </h3>
                  <p style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: 'var(--m-text-muted)' }}>
                    📹 {course.videos.length} · 📄 {course.documents.length}
                  </p>
                  {/* Progress */}
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--m-text-muted)' }}>Progress</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--m-accent-text)' }}>{percent}%</span>
                    </div>
                    <div style={{ height: '5px', borderRadius: '9999px', background: 'var(--m-track)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '9999px', background: 'var(--m-accent)', width: `${percent}%`, transition: 'width 600ms var(--m-ease)' }} />
                    </div>
                  </div>
                  <Link
                    to={`/student/courses/${course.id}`}
                    style={{
                      marginTop: '1.125rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '2.5rem',
                      borderRadius: '9999px',
                      background: 'var(--m-accent)',
                      color: '#020d1a',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      transition: 'all var(--m-duration) var(--m-ease)',
                      boxShadow: '0 2px 10px rgba(34,211,238,0.22)',
                    }}
                  >
                    Continue learning →
                  </Link>
                </div>
              )
            })}
          </div>
        </>
      )}

      {!loading && studentCourses.length === 0 && (
        <div style={{
          borderRadius: 'var(--m-r-xl)',
          border: '1px dashed var(--m-border-strong)',
          padding: '3rem 1.5rem',
          textAlign: 'center',
          color: 'var(--m-text-muted)',
          fontSize: '0.875rem',
        }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📚</p>
          No published courses are available yet. Check back soon.
        </div>
      )}
    </div>
  )
}

export default StudentDashboard
