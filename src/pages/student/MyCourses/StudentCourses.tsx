import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCourses } from '../../../hooks/useCourses'
import { useProgressOverview } from '../../../hooks/useProgressTracking'

const StudentCourses: React.FC = () => {
  const { studentCourses, loading, error, loadStudentCourses } = useCourses()
  const progress = useProgressOverview(studentCourses)

  useEffect(() => {
    loadStudentCourses()
  }, [loadStudentCourses])

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <div className="rounded-2xl border border-white/10 bg-slate-950/85 p-5 shadow-2xl shadow-slate-950/20 sm:rounded-3xl sm:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/70 sm:text-sm sm:tracking-[0.35em]">My courses</p>
        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">Your enrolled courses</h2>
        <p className="mt-2 text-slate-400">Watch lectures, download materials, and track your progress.</p>
      </div>

      {error && (
        <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</p>
      )}
      {loading && (
        <p className="rounded-2xl border border-white/10 bg-slate-950/75 px-4 py-3 text-sm text-slate-300">Loading courses…</p>
      )}

      <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
        {studentCourses.map((course) => (
          (() => {
            const summary = progress.summaries.find((item) => item.courseId === course.id)
            const percent = summary?.percent ?? course.progress
            return (
          <article
            key={course.id}
            className="flex flex-col rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-xl shadow-slate-950/20 transition hover:-translate-y-0.5 hover:border-cyan-500/30 sm:rounded-3xl"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">{course.category}</span>
              <span className="text-xs text-slate-500">{course.students} learners</span>
            </div>

            <h3 className="mt-4 text-lg font-semibold text-white">{course.title}</h3>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Progress</span>
                <span>{percent}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-800">
                <div
                  className="h-1.5 rounded-full bg-cyan-500 transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {/* Content summary */}
            <div className="mt-3 flex gap-3 text-xs text-slate-400">
              <span>📹 {course.videos.length} video{course.videos.length !== 1 ? 's' : ''}</span>
              <span>📄 {course.documents.length} file{course.documents.length !== 1 ? 's' : ''}</span>
            </div>

            <Link
              to={`/student/courses/${course.id}`}
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Open course
            </Link>
          </article>
            )
          })()
        ))}
      </div>

      {!loading && studentCourses.length === 0 && (
        <p className="rounded-2xl border border-white/10 bg-slate-950/75 px-4 py-3 text-sm text-slate-400">
          No published courses available yet. Check back when your teacher has published content.
        </p>
      )}
    </div>
  )
}

export default StudentCourses
