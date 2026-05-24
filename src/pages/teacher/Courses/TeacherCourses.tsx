import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCourses } from '../../../hooks/useCourses'
import type { CourseSummary } from '../../../context/course-context'
import { formatSize } from '../../../services/courseService'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/70 sm:text-sm sm:tracking-[0.35em]">
    {children}
  </p>
)

// ─── Upload row – generic ─────────────────────────────────────────────────────
interface UploadRowProps {
  courseId: string
  type: 'video' | 'image' | 'document'
  accept: string
  placeholder: string
  icon: string
  onUpload: (courseId: string, title: string, file: File) => Promise<void>
  loading: boolean
  accent?: string
}

const UploadRow: React.FC<UploadRowProps> = ({
  courseId, accept, placeholder, icon, onUpload, loading, accent = 'bg-cyan-500 hover:bg-cyan-400',
}) => {
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const ref = useRef<HTMLInputElement>(null)

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    // Simulate progress for UX
    const interval = setInterval(() => setProgress((p) => Math.min(p + 15, 90)), 150)
    try {
      await onUpload(courseId, title, file)
      setProgress(100)
      setTimeout(() => {
        setTitle(''); setFile(null); setProgress(0)
        if (ref.current) ref.current.value = ''
      }, 400)
    } finally {
      clearInterval(interval)
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={placeholder}
          className="min-h-10 flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
        />
        <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5">
          <span>{icon}</span>
          <span className="max-w-40 truncate">{file ? file.name : 'Choose file'}</span>
          {file && <span className="text-xs text-slate-500">({formatSize(file.size)})</span>}
          <input
            ref={ref}
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <button
          type="button"
          disabled={!file || loading || uploading}
          onClick={handleUpload}
          className={`min-h-10 rounded-full px-4 py-2 text-sm font-semibold text-slate-950 transition active:scale-95 disabled:opacity-40 ${accent}`}
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </div>

      {/* Progress bar */}
      {uploading && (
        <div className="h-1 w-full rounded-full bg-slate-800">
          <div
            className="h-1 rounded-full bg-cyan-400 transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

// ─── Video preview in teacher panel ──────────────────────────────────────────
const TeacherVideoRow: React.FC<{
  video: CourseSummary['videos'][number]
  courseId: string
  onRemove: (courseId: string, videoId: string) => void
}> = ({ video, courseId, onRemove }) => (
  <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-900/60 px-4 py-3">
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400 text-sm">
        🎬
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">{video.title}</p>
        <p className="text-xs text-slate-400">
          {video.fileName}
          {video.fileSize > 0 && <span className="ml-2 text-slate-500">· {formatSize(video.fileSize)}</span>}
          {!video.blobUrl && (
            <span className="ml-2 text-amber-400">⚠ URL expired — video still stored</span>
          )}
        </p>
      </div>
    </div>
    <div className="flex shrink-0 gap-2">
      {video.blobUrl && (
        <a
          href={video.blobUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-cyan-300 transition hover:bg-white/5"
        >
          Preview
        </a>
      )}
      <button
        onClick={() => onRemove(courseId, video.id)}
        className="rounded-full border border-rose-500/20 px-3 py-1.5 text-xs text-rose-300 transition hover:bg-rose-500/10"
      >
        Remove
      </button>
    </div>
  </div>
)

// ─── Image row in teacher panel ──────────────────────────────────────────────
const TeacherImageRow: React.FC<{
  image: CourseSummary['images'][number]
  courseId: string
  onRemove: (courseId: string, imageId: string) => void
}> = ({ image, courseId, onRemove }) => (
  <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-900/60 px-4 py-3">
    <div className="flex min-w-0 items-center gap-3">
      {image.blobUrl ? (
        <img
          src={image.blobUrl}
          alt={image.title}
          className="h-8 w-8 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-sm">
          🖼️
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">{image.title}</p>
        <p className="text-xs text-slate-400">
          {image.fileName}
          {image.fileSize > 0 && <span className="ml-2 text-slate-500">· {formatSize(image.fileSize)}</span>}
        </p>
      </div>
    </div>
    <button
      onClick={() => onRemove(courseId, image.id)}
      className="shrink-0 rounded-full border border-rose-500/20 px-3 py-1.5 text-xs text-rose-300 transition hover:bg-rose-500/10"
    >
      Remove
    </button>
  </div>
)

// ─── Doc row in teacher panel ─────────────────────────────────────────────────
const TeacherDocRow: React.FC<{
  doc: CourseSummary['documents'][number]
  courseId: string
  onRemove: (courseId: string, docId: string) => void
}> = ({ doc, courseId, onRemove }) => (
  <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-900/60 px-4 py-3">
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-sm">
        📄
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">{doc.title}</p>
        <p className="text-xs text-slate-400">
          {doc.fileName}
          {doc.fileSize > 0 && <span className="ml-2 text-slate-500">· {formatSize(doc.fileSize)}</span>}
        </p>
      </div>
    </div>
    <div className="flex shrink-0 gap-2">
      <a
        href={doc.base64}
        download={doc.fileName}
        className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-emerald-300 transition hover:bg-white/5"
      >
        Download
      </a>
      <button
        onClick={() => onRemove(courseId, doc.id)}
        className="rounded-full border border-rose-500/20 px-3 py-1.5 text-xs text-rose-300 transition hover:bg-rose-500/10"
      >
        Remove
      </button>
    </div>
  </div>
)

// ─── Course panel ─────────────────────────────────────────────────────────────
const CoursePanel: React.FC<{ course: CourseSummary }> = ({ course }) => {
  const { togglePublish, deleteCourse, addVideo, removeVideo, addImage, removeImage, addDocument, removeDocument, loading } = useCourses()
  const [expanded, setExpanded] = useState(false)

  const images = course.images ?? []

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/80 shadow-xl shadow-slate-950/20 sm:rounded-3xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
        <div className="min-w-0">
          <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">{course.category}</span>
          <h3 className="mt-2 text-lg font-semibold text-white">{course.title}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {course.videos.length} video{course.videos.length !== 1 ? 's' : ''} ·{' '}
            {images.length} photo{images.length !== 1 ? 's' : ''} ·{' '}
            {course.documents.length} document{course.documents.length !== 1 ? 's' : ''}
            {' '}·{' '}
            <span className={course.published ? 'text-emerald-400' : 'text-slate-500'}>
              {course.published ? '● Published' : '○ Draft'}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => togglePublish(course.id)}
            className={`min-h-9 rounded-full px-4 py-2 text-sm font-semibold transition ${
              course.published
                ? 'border border-white/10 text-slate-300 hover:bg-white/5'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
            }`}
          >
            {course.published ? 'Unpublish' : 'Publish'}
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="min-h-9 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5"
          >
            {expanded ? 'Collapse' : 'Manage'}
          </button>
          <Link
            to={`/teacher/courses/${course.id}`}
            className="min-h-9 rounded-full border border-cyan-500/25 px-4 py-2 text-sm text-cyan-300 transition hover:bg-cyan-500/10"
          >
            Discussions
          </Link>
          <button
            onClick={() => { if (window.confirm('Delete this course?')) deleteCourse(course.id) }}
            className="min-h-9 rounded-full border border-rose-500/30 px-4 py-2 text-sm text-rose-300 transition hover:bg-rose-500/10"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="space-y-6 border-t border-white/8 p-5 sm:p-6">

          {/* Videos */}
          <section>
            <SectionLabel>Video lessons</SectionLabel>
            <div className="mt-3 space-y-2">
              {course.videos.map((v) => (
                <TeacherVideoRow key={v.id} video={v} courseId={course.id} onRemove={removeVideo} />
              ))}
              {course.videos.length === 0 && (
                <p className="text-sm text-slate-500">No videos yet.</p>
              )}
            </div>
            <div className="mt-3">
              <UploadRow
                courseId={course.id}
                type="video"
                accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                placeholder="Video title (optional)"
                icon="🎬"
                onUpload={addVideo}
                loading={loading}
                accent="bg-cyan-500 hover:bg-cyan-400"
              />
            </div>
          </section>

          {/* Photos */}
          <section>
            <SectionLabel>Photos</SectionLabel>
            <div className="mt-3 space-y-2">
              {images.map((img) => (
                <TeacherImageRow key={img.id} image={img} courseId={course.id} onRemove={removeImage} />
              ))}
              {images.length === 0 && (
                <p className="text-sm text-slate-500">No photos yet.</p>
              )}
            </div>
            <div className="mt-3">
              <UploadRow
                courseId={course.id}
                type="image"
                accept="image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                placeholder="Photo title (optional)"
                icon="🖼️"
                onUpload={addImage}
                loading={loading}
                accent="bg-violet-500 hover:bg-violet-400"
              />
            </div>
          </section>

          {/* Documents */}
          <section>
            <SectionLabel>Course materials</SectionLabel>
            <div className="mt-3 space-y-2">
              {course.documents.map((d) => (
                <TeacherDocRow key={d.id} doc={d} courseId={course.id} onRemove={removeDocument} />
              ))}
              {course.documents.length === 0 && (
                <p className="text-sm text-slate-500">No documents yet.</p>
              )}
            </div>
            <div className="mt-3">
              <UploadRow
                courseId={course.id}
                type="document"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.xlsx,.csv"
                placeholder="Document title (optional)"
                icon="📄"
                onUpload={addDocument}
                loading={loading}
                accent="bg-emerald-500 hover:bg-emerald-400"
              />
            </div>
          </section>

        </div>
      )}
    </div>
  )
}

// ─── New course form ──────────────────────────────────────────────────────────
const NewCourseForm: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const { createCourse, loading } = useCourses()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await createCourse(title, category)
    onDone()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-cyan-500/20 bg-cyan-950/30 p-5 sm:rounded-3xl sm:p-6"
    >
      <h3 className="text-lg font-semibold text-white">Create new course</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm text-slate-300">
            Course title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. React for Beginners"
            className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Engineering"
            className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="min-h-11 rounded-full bg-cyan-500 px-6 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
        >
          {loading ? 'Creating…' : 'Create course'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="min-h-11 rounded-full border border-white/10 px-6 py-2 text-sm text-slate-300 transition hover:bg-white/5"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
const TeacherCourses: React.FC = () => {
  const { teacherCourses, loading, error, loadTeacherCourses } = useCourses()
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { loadTeacherCourses() }, [loadTeacherCourses])

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/85 p-5 shadow-2xl shadow-slate-950/20 sm:rounded-3xl sm:p-8">
        <div className="min-w-0">
          <SectionLabel>Course library</SectionLabel>
          <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">Manage your courses</h2>
          <p className="mt-2 text-slate-400">
            Create courses, upload videos, photos, and documents, then publish to students.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="min-h-11 rounded-full bg-cyan-500 px-6 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          {showForm ? 'Cancel' : '+ New course'}
        </button>
      </div>

      {showForm && <NewCourseForm onDone={() => setShowForm(false)} />}

      {error && (
        <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </p>
      )}

      {loading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-900/60 sm:rounded-3xl" />
          ))}
        </div>
      )}

      <div className="space-y-4">
        {teacherCourses.map((course) => (
          <CoursePanel key={course.id} course={course} />
        ))}
      </div>

      {!loading && teacherCourses.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-slate-950/75 px-6 py-10 text-center">
          <p className="text-3xl">📚</p>
          <p className="mt-3 text-sm text-slate-400">
            No courses yet. Click <span className="text-cyan-400">"+ New course"</span> to get started.
          </p>
        </div>
      )}
    </div>
  )
}

export default TeacherCourses
