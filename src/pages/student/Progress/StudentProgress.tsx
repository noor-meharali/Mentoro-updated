import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCourses } from '../../../hooks/useCourses'
import { useProgressOverview } from '../../../hooks/useProgressTracking'

const fmtTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

const Ring: React.FC<{ value: number }> = ({ value }) => {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  return (
    <div className="relative h-28 w-28">
      <svg viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (value / 100) * circumference}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-white">{value}%</span>
      </div>
    </div>
  )
}

const StatCard: React.FC<{ label: string; value: string | number; hint?: string }> = ({ label, value, hint }) => (
  <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-xl shadow-slate-950/15 sm:rounded-3xl sm:p-6">
    <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/70">{label}</p>
    <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
    {hint && <p className="mt-2 text-sm text-slate-500">{hint}</p>}
  </div>
)

const StudentProgress: React.FC = () => {
  const { studentCourses, loading, error, loadStudentCourses } = useCourses()
  const progress = useProgressOverview(studentCourses)

  useEffect(() => {
    loadStudentCourses()
  }, [loadStudentCourses])

  const continueCourse = studentCourses.find((course) => course.id === progress.continueCourse?.courseId)

  return (
    <div className="min-w-0 space-y-5 sm:space-y-8">
      <div className="rounded-2xl border border-white/10 bg-slate-950/85 p-5 shadow-2xl shadow-slate-950/20 sm:rounded-3xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/70 sm:text-sm sm:tracking-[0.35em]">
              Learning analytics
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">Learning progress</h2>
            <p className="mt-3 max-w-2xl text-slate-400">
              Progress now updates from watched lessons, viewed resources, quiz attempts, and assignment submissions.
            </p>
          </div>
          <Ring value={progress.overallPercent} />
        </div>
      </div>

      {error && (
        <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</p>
      )}
      {loading && (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl bg-white/5" />)}
        </div>
      )}

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Completed lessons" value={`${progress.completedLessons}/${progress.totalLessons}`} />
        <StatCard label="Remaining" value={progress.remainingLessons} hint="Lessons still in progress" />
        <StatCard label="Current streak" value={`${progress.streakDays} days`} />
        <StatCard label="Time spent" value={fmtTime(progress.timeSpentSeconds)} />
      </div>

      {continueCourse && progress.continueCourse && (
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-5 sm:rounded-3xl sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">Continue learning</p>
              <h3 className="mt-2 text-lg font-semibold text-white">{continueCourse.title}</h3>
              <p className="mt-1 text-sm text-slate-400">
                {progress.continueCourse.lastAccessedTitle
                  ? `Resume ${progress.continueCourse.lastAccessedTitle}`
                  : 'Start your first lesson'}
              </p>
            </div>
            <Link
              to={`/student/courses/${continueCourse.id}`}
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Continue
            </Link>
          </div>
          <div className="mt-4 h-2 rounded-full bg-slate-900">
            <div className="h-2 rounded-full bg-cyan-400 transition-all" style={{ width: `${progress.continueCourse.percent}%` }} />
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Course progress</h3>
          {progress.summaries.map((summary) => (
            <div key={summary.courseId} className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 sm:rounded-3xl">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-white">{summary.title}</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    {summary.completedLessons}/{summary.totalLessons} lessons · {summary.completedQuizzes}/{summary.totalQuizzes} quizzes · {summary.submittedAssignments}/{summary.totalAssignments} assignments
                  </p>
                </div>
                <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-sm font-semibold text-cyan-300">{summary.percent}%</span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-slate-800">
                <div className="h-2 rounded-full bg-cyan-500 transition-all" style={{ width: `${summary.percent}%` }} />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-4">
                {[
                  ['Videos', summary.videosPercent],
                  ['Quizzes', summary.quizzesPercent],
                  ['Assignments', summary.assignmentsPercent],
                  ['Resources', summary.resourcesPercent],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-slate-900/60 p-3">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-1 text-lg font-semibold text-white">{value}%</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {!loading && progress.summaries.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/70 p-8 text-center">
              <p className="font-semibold text-white">No progress yet</p>
              <p className="mt-1 text-sm text-slate-500">Open a course and start learning to build your analytics.</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 sm:rounded-3xl">
          <h3 className="text-lg font-semibold text-white">Recent activity</h3>
          <div className="mt-4 space-y-3">
            {progress.recentActivities.map((activity) => (
              <div key={activity.id} className="rounded-2xl bg-slate-900/60 p-3">
                <p className="text-sm font-medium text-white">{activity.title}</p>
                <p className="mt-1 text-xs text-slate-500">{activity.type.replace('_', ' ')} · {new Date(activity.createdAt).toLocaleString()}</p>
              </div>
            ))}
            {progress.recentActivities.length === 0 && (
              <p className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-slate-500">
                Activity appears here as you watch, submit, and complete lessons.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentProgress
