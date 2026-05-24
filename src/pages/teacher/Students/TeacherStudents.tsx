import React from 'react'
import { Link } from 'react-router-dom'
import { useTeacherStudents } from '../../../hooks/useTeacherStudents'
import type { TeacherStudentRow } from '../../../services/teacherStudentService'

const formatTime = (value: string | null) => {
  if (!value) return 'No activity yet'
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

const Avatar: React.FC<{ row: TeacherStudentRow }> = ({ row }) => {
  const initials = row.studentName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  if (row.avatarBase64) {
    return <img src={row.avatarBase64} alt={row.studentName} className="h-11 w-11 rounded-full object-cover" />
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-sm font-bold text-cyan-300">
      {initials || 'ST'}
    </div>
  )
}

const StatusBadge: React.FC<{ status: TeacherStudentRow['status'] }> = ({ status }) => {
  const classes = {
    Active: 'bg-emerald-500/15 text-emerald-300',
    Pending: 'bg-amber-500/15 text-amber-300',
    Completed: 'bg-cyan-500/15 text-cyan-300',
    Inactive: 'bg-slate-500/15 text-slate-300',
  }
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${classes[status]}`}>{status}</span>
}

const MetricCard: React.FC<{ label: string; value: string | number; hint: string }> = ({ label, value, hint }) => (
  <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-xl shadow-slate-950/15 sm:rounded-3xl">
    <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/70">{label}</p>
    <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    <p className="mt-2 text-sm text-slate-500">{hint}</p>
  </div>
)

const StudentRowCard: React.FC<{ row: TeacherStudentRow }> = ({ row }) => (
  <article className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 shadow-xl shadow-slate-950/15 transition hover:border-cyan-500/25 sm:rounded-3xl sm:p-5">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 gap-3">
        <Avatar row={row} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold text-white">{row.studentName}</h3>
            <StatusBadge status={row.status} />
          </div>
          <p className="mt-1 truncate text-sm text-slate-400">{row.email}</p>
          <p className="mt-2 text-sm text-slate-300">
            Enrolled in <span className="font-medium text-white">{row.courseTitle}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Enrollment: {row.enrollmentTimestamp ? formatTime(row.enrollmentTimestamp) : 'Created from student account'}
          </p>
        </div>
      </div>
      <div className="min-w-32 text-left sm:text-right">
        <p className="text-2xl font-semibold text-white">{row.progressPercent}%</p>
        <p className="text-xs text-slate-500">course progress</p>
      </div>
    </div>

    <div className="mt-4 h-2 rounded-full bg-slate-800">
      <div className="h-2 rounded-full bg-cyan-400 transition-all" style={{ width: `${row.progressPercent}%` }} />
    </div>

    <div className="mt-4 grid gap-3 md:grid-cols-3">
      <div className="rounded-2xl bg-slate-900/60 p-3">
        <p className="text-xs text-slate-500">Video watched</p>
        <p className="mt-1 text-lg font-semibold text-white">{row.videoWatchedPercent}%</p>
      </div>
      <div className="rounded-2xl bg-slate-900/60 p-3">
        <p className="text-xs text-slate-500">Assignments</p>
        <p className="mt-1 text-lg font-semibold text-white">{row.assignmentProgressLabel}</p>
      </div>
      <div className="rounded-2xl bg-slate-900/60 p-3">
        <p className="text-xs text-slate-500">Last active</p>
        <p className="mt-1 text-sm font-medium text-white">{formatTime(row.lastActiveAt)}</p>
      </div>
    </div>

    <div className="mt-4 rounded-2xl border border-white/8 bg-slate-900/45 p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-cyan-300/70">Coaching assignment</p>
          <p className="mt-1 text-sm text-white">{row.teacherName}</p>
        </div>
        <div className="min-w-0 text-left sm:text-right">
          <p className="text-xs text-slate-500">Course/module assigned</p>
          <p className="truncate text-sm font-medium text-slate-200">{row.moduleAssigned}</p>
        </div>
      </div>
    </div>
  </article>
)

const TeacherStudents: React.FC = () => {
  const { rows, activeCount, pendingCount, completedCount, averageProgress, loading, error } = useTeacherStudents()

  return (
    <div className="min-w-0 space-y-5 sm:space-y-8">
      <div className="rounded-2xl border border-white/10 bg-slate-950/85 p-5 shadow-2xl shadow-slate-950/20 sm:rounded-3xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/70 sm:text-sm sm:tracking-[0.35em]">
              Student workspace
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">Student management</h2>
            <p className="mt-3 text-slate-400">
              Live enrollment, engagement, coaching, and progress data from Mentoro activity records.
            </p>
          </div>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300">
            Live sync enabled
          </span>
        </div>
      </div>

      {error && (
        <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</p>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl bg-white/5" />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Enrolled students" value={rows.length} hint="Live course enrollment rows" />
          <MetricCard label="Active now" value={activeCount} hint="Updated from recent activity" />
          <MetricCard label="Pending" value={pendingCount} hint="No learning activity yet" />
          <MetricCard label="Avg. progress" value={`${averageProgress}%`} hint={`${completedCount} completed enrollment${completedCount === 1 ? '' : 's'}`} />
        </div>
      )}

      {!loading && rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/75 px-6 py-12 text-center sm:rounded-3xl">
          <p className="text-lg font-semibold text-white">No students enrolled yet</p>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
            Students appear here after real student accounts and published course enrollments exist in Mentoro.
          </p>
          <Link
            to="/teacher/courses"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-cyan-500 px-6 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Invite Students
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">Student enrollment feed</h3>
            <p className="text-sm text-slate-500">Updates automatically when learners enroll or progress changes.</p>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {rows.map((row) => <StudentRowCard key={row.id} row={row} />)}
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherStudents
