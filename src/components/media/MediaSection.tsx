import React, { useState, useMemo } from 'react'
import type { CourseSummary } from '../../context/course-context'
import { VideoPlayer } from './VideoPlayer'
import { ImageGallery } from './ImageGallery'
import { DocumentCard } from './DocumentCard'
import { LessonDiscussion } from '../discussions/LessonDiscussion'
import { LessonAssessments } from '../assessments/LessonAssessments'
import { useCourseProgress } from '../../hooks/useProgressTracking'

type Tab = 'videos' | 'photos' | 'documents'

interface MediaSectionProps {
  course: CourseSummary
}

const EmptyState: React.FC<{ icon: string; message: string }> = ({ icon, message }) => (
  <div className="flex flex-col items-center gap-3 py-12 text-center">
    <span className="text-4xl opacity-40">{icon}</span>
    <p className="text-sm text-slate-500">{message}</p>
  </div>
)

const LessonProgressStrip: React.FC<{
  percent: number
  completed: boolean
  onComplete: () => void
}> = ({ percent, completed, onComplete }) => (
  <div className="mb-3 rounded-2xl border border-white/8 bg-slate-950/55 p-3">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
          <span>{completed ? 'Lesson complete' : 'Watch progress'}</span>
          <span className={completed ? 'text-emerald-300' : 'text-cyan-300'}>{percent}%</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-slate-800">
          <div
            className={`h-1.5 rounded-full transition-all ${completed ? 'bg-emerald-400' : 'bg-cyan-400'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <button
        onClick={onComplete}
        disabled={completed}
        className="min-h-8 rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/5 disabled:border-emerald-500/20 disabled:bg-emerald-500/10 disabled:text-emerald-300"
      >
        {completed ? 'Completed' : 'Mark complete'}
      </button>
    </div>
  </div>
)

export const MediaSection: React.FC<MediaSectionProps> = ({ course }) => {
  const [tab, setTab] = useState<Tab>('videos')
  const [search, setSearch] = useState('')
  const [sortLatest, setSortLatest] = useState(true)
  const progress = useCourseProgress(course)

  const videos = useMemo(() => course.videos ?? [], [course.videos])
  const images = useMemo(() => course.images ?? [], [course.images])
  const documents = useMemo(() => course.documents ?? [], [course.documents])

  const tabCounts = { videos: videos.length, photos: images.length, documents: documents.length }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()

    const filterItems = <T extends { title: string; fileName: string; uploadedAt: string }>(
      items: T[]
    ) => {
      let result = q
        ? items.filter((i) => i.title.toLowerCase().includes(q) || i.fileName.toLowerCase().includes(q))
        : items
      if (sortLatest) result = [...result].reverse()
      return result
    }

    return {
      videos: filterItems(videos),
      images: filterItems(images),
      documents: filterItems(documents),
    }
  }, [search, sortLatest, videos, images, documents])

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'videos', label: 'Videos', icon: '🎬' },
    { id: 'photos', label: 'Photos', icon: '🖼️' },
    { id: 'documents', label: 'Documents', icon: '📁' },
  ]

  const totalCount = videos.length + images.length + documents.length

  if (totalCount === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-6 sm:rounded-3xl">
        <EmptyState icon="📂" message="No content uploaded for this course yet. Check back soon." />
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/80 shadow-xl sm:rounded-3xl overflow-hidden">
      {/* Tab bar */}
      <div className="border-b border-white/8 px-4 pt-4 sm:px-6">
        <div className="flex items-center gap-1">
          {tabs.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`relative flex items-center gap-1.5 rounded-t-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                tab === id
                  ? 'text-white bg-white/5'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{icon}</span>
              <span className="hidden sm:inline">{label}</span>
              {tabCounts[id] > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  tab === id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/10 text-slate-400'
                }`}>
                  {tabCounts[id]}
                </span>
              )}
              {tab === id && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-cyan-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      {totalCount > 1 && (
        <div className="flex flex-wrap items-center gap-3 border-b border-white/5 px-4 py-3 sm:px-6">
          {/* Search */}
          <div className="relative flex-1 min-w-40">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files…"
              className="h-8 w-full rounded-xl bg-white/5 pl-8 pr-3 text-xs text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>

          {/* Sort toggle */}
          <button
            onClick={() => setSortLatest((v) => !v)}
            className={`flex h-8 items-center gap-1.5 rounded-xl px-3 text-xs transition ${
              sortLatest
                ? 'bg-cyan-500/15 text-cyan-400'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
              <path d="M3 6h18M7 12h10M11 18h2" strokeLinecap="round" />
            </svg>
            {sortLatest ? 'Latest first' : 'Oldest first'}
          </button>
        </div>
      )}

      {/* Content */}
      <div className="p-4 sm:p-6">
        {tab === 'videos' && (
          filtered.videos.length > 0 ? (
            <div className="space-y-3">
              {filtered.videos.map((v) => (
                <div key={v.id}>
                  <LessonProgressStrip
                    percent={progress.summary?.lessons.find((lesson) => lesson.lessonId === v.id)?.videoPercent ?? 0}
                    completed={Boolean(progress.summary?.lessons.find((lesson) => lesson.lessonId === v.id)?.completed)}
                    onComplete={() => progress.markLessonComplete(v.id, v.title)}
                  />
                  <VideoPlayer
                    video={v}
                    initialPositionSeconds={progress.summary?.lessons.find((lesson) => lesson.lessonId === v.id)?.lastPositionSeconds ?? 0}
                    maxAllowedSeekSeconds={
                      (progress.summary?.lessons.find((lesson) => lesson.lessonId === v.id)?.lastPositionSeconds ?? 0) +
                      Math.max(0, (v.fileSize || 0) === 0 ? 0 : 0)
                    }
                    onWatchProgress={(current, duration) => progress.trackVideoWatch(v.id, v.title, current, duration)}
                  />
                  <LessonAssessments courseId={course.id} lessonId={v.id} lessonTitle={v.title} />
                  <LessonDiscussion courseId={course.id} lessonId={v.id} lessonTitle={v.title} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="🎬"
              message={search ? 'No videos match your search.' : 'No videos uploaded yet.'}
            />
          )
        )}

        {tab === 'photos' && (
          filtered.images.length > 0 ? (
            <ImageGallery
              images={filtered.images}
              onView={(imageId, title) => progress.trackResourceView(`image-${imageId}`, imageId, title)}
            />
          ) : (
            <EmptyState
              icon="🖼️"
              message={search ? 'No photos match your search.' : 'No photos uploaded yet.'}
            />
          )
        )}

        {tab === 'documents' && (
          filtered.documents.length > 0 ? (
            <div className="space-y-3">
              {filtered.documents.map((d) => (
                <DocumentCard
                  key={d.id}
                  doc={d}
                  onView={(docId, title) => progress.trackResourceView(`document-${docId}`, docId, title)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="📁"
              message={search ? 'No documents match your search.' : 'No documents uploaded yet.'}
            />
          )
        )}
      </div>
    </div>
  )
}

export default MediaSection
