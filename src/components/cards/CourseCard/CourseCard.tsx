import React from 'react'
import type { CourseSummary } from '../../../context/course-context'
import styles from './CourseCard.module.css'

interface CourseCardProps {
  course: CourseSummary
  onSelect?: (id: string) => void
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onSelect }) => {
  return (
    <article className={`${styles.card} group flex min-w-0 flex-col rounded-2xl border border-white/10 bg-slate-950/80 p-4 transition hover:-translate-y-1 hover:border-cyan-500/30 sm:rounded-3xl sm:p-6`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="max-w-full rounded-full bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-cyan-300 sm:tracking-[0.18em]">
          {course.category}
        </span>
        <span className="text-sm text-slate-400">{course.students} learners</span>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-white sm:text-xl">{course.title}</h3>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
        <span>{course.progress}% progress</span>
        <span>{course.published ? 'Published' : 'Draft'}</span>
      </div>
      <button
        onClick={() => onSelect?.(course.id)}
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 sm:w-fit"
      >
        View course
      </button>
    </article>
  )
}

export default CourseCard
