import React, { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useCourses } from '../../../hooks/useCourses'
import { MediaSection } from '../../../components/media/MediaSection'
import { useAuth } from '../../../hooks/useAuth'
import { useCourseProgress } from '../../../hooks/useProgressTracking'

// ─── Skeleton loader ───────────────────────────────────────────────────────────
const Skeleton: React.FC = () => (
  <div className="space-y-5 sm:space-y-6 animate-pulse">
    <div className="rounded-3xl border border-white/5 bg-slate-900/60 p-6 sm:p-8">
      <div className="h-3 w-24 rounded-full bg-white/10" />
      <div className="mt-4 h-7 w-64 rounded-full bg-white/10" />
      <div className="mt-3 h-5 w-32 rounded-full bg-white/10" />
    </div>
    <div className="rounded-3xl border border-white/5 bg-slate-900/60 p-6 sm:p-8">
      <div className="h-3 w-32 rounded-full bg-white/10" />
      <div className="mt-5 space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-white/5" />
        ))}
      </div>
    </div>
  </div>
)

// ─── Progress ring ────────────────────────────────────────────────────────────
const ProgressRing: React.FC<{ progress: number }> = ({ progress }) => {
  const r = 28
  const circ = 2 * Math.PI * r
  const dash = (progress / 100) * circ
  return (
    <svg width="72" height="72" className="rotate-[-90deg]">
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
      <circle
        cx="36" cy="36" r={r}
        fill="none"
        stroke="#22d3ee"
        strokeWidth="4"
        strokeDasharray={circ}
        strokeDashoffset={circ - dash}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
const CourseDetails: React.FC = () => {
  const { courseId } = useParams()
  const { user } = useAuth()
  const {
    teacherCourses,
    studentCourses,
    selectedCourse,
    selectCourse,
    loadTeacherCourses,
    loadStudentCourses,
    loading,
  } = useCourses()
  const visibleCourses = user?.role === 'teacher' ? teacherCourses : studentCourses
  const progress = useCourseProgress(selectedCourse)

  useEffect(() => {
    if (user?.role === 'teacher') {
      if (teacherCourses.length === 0) loadTeacherCourses()
      return
    }
    if (studentCourses.length === 0) loadStudentCourses()
  }, [loadStudentCourses, loadTeacherCourses, studentCourses.length, teacherCourses.length, user?.role])

  useEffect(() => {
    if (courseId) selectCourse(courseId)
  }, [courseId, selectCourse, visibleCourses])

  if (!courseId) return <Navigate to={user?.role === 'teacher' ? '/teacher/courses' : '/student/courses'} replace />

  if (loading) return <Skeleton />

  if (!selectedCourse) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-950/85 p-6 sm:p-8 text-center">
        <p className="text-4xl">🔍</p>
        <p className="mt-3 text-lg font-semibold text-white">Course not found</p>
        <p className="mt-1 text-sm text-slate-400">
          This course may have been removed or you don't have access.
        </p>
      </div>
    )
  }

  const totalVideos = selectedCourse.videos.length
  const totalImages = (selectedCourse.images ?? []).length
  const totalDocs = selectedCourse.documents.length
  const totalItems = totalVideos + totalImages + totalDocs

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      {/* Header card */}
      <div className="rounded-2xl border border-white/10 bg-slate-950/85 p-5 shadow-2xl shadow-slate-950/20 sm:rounded-3xl sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/70 sm:text-sm sm:tracking-[0.35em]">
              Course details
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl leading-tight">
              {selectedCourse.title}
            </h2>
            <span className="mt-3 inline-block rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
              {selectedCourse.category}
            </span>
          </div>

          {/* Progress ring */}
          <div className="flex shrink-0 flex-col items-center gap-1 relative">
            <ProgressRing progress={progress.summary?.percent ?? selectedCourse.progress} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-white">{progress.summary?.percent ?? selectedCourse.progress}%</span>
            </div>
            <span className="mt-9 text-xs text-slate-400">Progress</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-5 flex flex-wrap gap-4 border-t border-white/5 pt-4">
          {[
            { icon: '🎬', label: 'Videos', count: totalVideos },
            { icon: '🖼️', label: 'Photos', count: totalImages },
            { icon: '📄', label: 'Documents', count: totalDocs },
          ].map(({ icon, label, count }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-base">{icon}</span>
              <span className="text-sm text-slate-300">
                <span className="font-semibold text-white">{count}</span> {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Media section */}
      {totalItems > 0 ? (
        <MediaSection course={selectedCourse} />
      ) : (
        <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-8 sm:rounded-3xl text-center">
          <p className="text-4xl">📂</p>
          <p className="mt-3 text-base font-medium text-white">No content yet</p>
          <p className="mt-1 text-sm text-slate-400">
            Your teacher hasn't uploaded any videos, photos, or documents to this course yet.
            Check back soon!
          </p>
        </div>
      )}
    </div>
  )
}

export default CourseDetails
