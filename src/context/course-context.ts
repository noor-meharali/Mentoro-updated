import { createContext } from 'react'

// ─── Data shapes ──────────────────────────────────────────────────────────────

export interface CourseVideo {
  id: string
  title: string
  fileName: string
  /** Fresh ObjectURL from IndexedDB on each session load. Empty = not loaded yet. */
  blobUrl: string
  mimeType: string
  fileSize: number
  uploadedAt: string
}

export interface CourseImage {
  id: string
  title: string
  fileName: string
  /** Fresh ObjectURL from IndexedDB on each session load. */
  blobUrl: string
  mimeType: string
  fileSize: number
  uploadedAt: string
}

export interface CourseDocument {
  id: string
  title: string
  fileName: string
  base64: string
  mimeType: string
  fileSize: number
  uploadedAt: string
}

export interface CourseSummary {
  id: string
  title: string
  category: string
  students: number
  progress: number
  published: boolean
  videos: CourseVideo[]
  images: CourseImage[]
  documents: CourseDocument[]
}

// ─── Context value ────────────────────────────────────────────────────────────

export interface CourseContextValue {
  teacherCourses: CourseSummary[]
  studentCourses: CourseSummary[]
  selectedCourse: CourseSummary | null
  loading: boolean
  error: string | null

  loadTeacherCourses: () => Promise<void>
  loadStudentCourses: () => Promise<void>
  selectCourse: (id: string) => void

  createCourse: (title: string, category: string) => Promise<CourseSummary>
  togglePublish: (id: string) => void
  deleteCourse: (id: string) => void

  addVideo: (courseId: string, title: string, file: File) => Promise<void>
  removeVideo: (courseId: string, videoId: string) => void

  addImage: (courseId: string, title: string, file: File) => Promise<void>
  removeImage: (courseId: string, imageId: string) => void

  addDocument: (courseId: string, title: string, file: File) => Promise<void>
  removeDocument: (courseId: string, docId: string) => void
}

export const CourseContext = createContext<CourseContextValue | null>(null)
