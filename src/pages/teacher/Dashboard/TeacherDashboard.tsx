import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCourses } from '../../../hooks/useCourses'

const TeacherDashboard: React.FC = () => {
  const { teacherCourses, loading, error, loadTeacherCourses } = useCourses()

  useEffect(() => {
    loadTeacherCourses()
  }, [loadTeacherCourses])

  const published = teacherCourses.filter((c) => c.published).length
  const totalVideos = teacherCourses.reduce((sum, c) => sum + c.videos.length, 0)
  const totalDocs = teacherCourses.reduce((sum, c) => sum + c.documents.length, 0)

  const stats = [
    { label: 'Total courses', value: teacherCourses.length, icon: '📚', color: 'var(--m-accent)' },
    { label: 'Published',      value: published,             icon: '✅', color: '#34d399' },
    { label: 'Videos',         value: totalVideos,           icon: '🎬', color: '#a78bfa' },
    { label: 'Documents',      value: totalDocs,             icon: '📄', color: '#fb923c' },
  ]

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
      {/* ── Header ──────────────────────────────── */}
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
              Teacher dashboard
            </p>
            <h2 style={{ marginTop: '0.5rem', fontSize: 'clamp(1.35rem, 3vw, 1.75rem)', fontWeight: 700, color: 'var(--m-text-strong)', margin: '0.5rem 0 0' }}>
              Active course performance
            </h2>
            <p style={{ marginTop: '0.375rem', fontSize: '0.875rem', color: 'var(--m-text-muted)', margin: '0.375rem 0 0' }}>
              Manage your courses, track student progress, and grow your reach.
            </p>
          </div>
          <Link
            to="/teacher/courses"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              minHeight: '2.625rem',
              padding: '0.625rem 1.25rem',
              borderRadius: '9999px',
              background: 'var(--m-accent)',
              color: '#020d1a',
              fontSize: '0.8125rem',
              fontWeight: 700,
              textDecoration: 'none',
              flexShrink: 0,
              boxShadow: '0 2px 10px rgba(34,211,238,0.22)',
              transition: 'all var(--m-duration) var(--m-ease)',
            }}
          >
            + New course
          </Link>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────── */}
      <div style={{ display: 'grid', gap: '0.875rem', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--m-text-muted)', margin: 0 }}>
                {stat.label}
              </p>
              <span style={{ fontSize: '1.1rem' }}>{stat.icon}</span>
            </div>
            <p style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--m-text-strong)', margin: 0, lineHeight: 1 }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ borderRadius: 'var(--m-r-md)', border: '1px solid rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.08)', padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--m-danger)' }}>
          {error}
        </div>
      )}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: '4.5rem', borderRadius: 'var(--m-r-lg)' }} />)}
        </div>
      )}

      {/* ── Recent courses list ──────────────────── */}
      {!loading && teacherCourses.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--m-text-strong)', margin: 0 }}>Recent courses</h3>
            <Link to="/teacher/courses" style={{ fontSize: '0.8125rem', color: 'var(--m-accent-text)', fontWeight: 500, opacity: 0.85 }}>
              View all →
            </Link>
          </div>
          {teacherCourses.slice(0, 5).map((course) => (
            <div
              key={course.id}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                borderRadius: 'var(--m-r-lg)',
                border: '1px solid var(--m-border)',
                background: 'var(--m-surface-card)',
                backdropFilter: 'blur(16px)',
                padding: '1rem 1.125rem',
                transition: 'border-color var(--m-duration) var(--m-ease)',
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontWeight: 600, color: 'var(--m-text-strong)', fontSize: '0.875rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {course.title}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--m-text-muted)', marginTop: '0.25rem', margin: '0.25rem 0 0' }}>
                  {course.videos.length} video{course.videos.length !== 1 ? 's' : ''} · {course.documents.length} doc{course.documents.length !== 1 ? 's' : ''} ·{' '}
                  <span style={{ color: course.published ? 'var(--m-success)' : 'var(--m-text-faint)', fontWeight: 500 }}>
                    {course.published ? 'Published' : 'Draft'}
                  </span>
                </p>
              </div>
              <Link
                to="/teacher/courses"
                style={{
                  flexShrink: 0,
                  padding: '0.4375rem 1rem',
                  borderRadius: '9999px',
                  border: '1px solid var(--m-border-strong)',
                  background: 'transparent',
                  color: 'var(--m-text)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all var(--m-duration) var(--m-ease)',
                  whiteSpace: 'nowrap',
                }}
              >
                Manage
              </Link>
            </div>
          ))}
        </div>
      )}

      {!loading && teacherCourses.length === 0 && (
        <div style={{
          borderRadius: 'var(--m-r-xl)',
          border: '1px dashed var(--m-border-strong)',
          padding: '3rem 1.5rem',
          textAlign: 'center',
          color: 'var(--m-text-muted)',
          fontSize: '0.875rem',
        }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🎓</p>
          No courses yet. Click &ldquo;+ New course&rdquo; to get started.
        </div>
      )}
    </div>
  )
}

export default TeacherDashboard
