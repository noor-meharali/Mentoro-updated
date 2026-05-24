import React, { useEffect } from 'react'
import { useCourses } from '../../../hooks/useCourses'
import { useTeacherProgressAnalytics } from '../../../hooks/useProgressTracking'

const fmtTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

const TeacherAnalytics: React.FC = () => {
  const { teacherCourses, loadTeacherCourses, loading } = useCourses()
  const analytics = useTeacherProgressAnalytics(teacherCourses)

  useEffect(() => {
    loadTeacherCourses()
  }, [loadTeacherCourses])

  return (
    <div className="min-w-0 space-y-5 sm:space-y-8">
      <div className="rounded-2xl border border-white/10 bg-slate-950/85 p-5 shadow-2xl shadow-slate-950/20 sm:rounded-3xl sm:p-8">
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">Performance analytics</h2>
        <p className="mt-3 text-slate-400">Track real student progress from watched lessons, resources, quizzes, and submissions.</p>
      </div>

      {loading && <div className="h-24 animate-pulse rounded-2xl bg-white/5" />}

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Tracked students', value: analytics.trackedStudents },
          { label: 'Completion rate', value: `${analytics.averageProgress}%` },
          { label: 'Lessons completed', value: analytics.completedLessons },
          { label: 'Time spent', value: fmtTime(analytics.timeSpentSeconds) },
        ].map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-xl shadow-slate-950/15 sm:rounded-3xl sm:p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/70 sm:text-sm sm:tracking-[0.35em]">{metric.label}</p>
            <p className="mt-4 break-words text-3xl font-semibold text-white sm:text-4xl">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 sm:rounded-3xl sm:p-6">
        <h3 className="text-lg font-semibold text-white">Course progress</h3>
        <div className="mt-4 space-y-3">
          {analytics.courseRows.map((course) => (
            <div key={course.courseId} className="rounded-2xl bg-slate-900/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{course.title}</p>
                  <p className="text-xs text-slate-500">{course.students} tracked learner{course.students === 1 ? '' : 's'}</p>
                </div>
                <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-sm font-semibold text-cyan-300">{course.averageProgress}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-800">
                <div className="h-2 rounded-full bg-cyan-400 transition-all" style={{ width: `${course.averageProgress}%` }} />
              </div>
            </div>
          ))}
          {analytics.courseRows.length === 0 && (
            <p className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-slate-500">
              Student progress appears here after learners interact with published courses.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default TeacherAnalytics
