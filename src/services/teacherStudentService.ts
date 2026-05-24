import type { CourseSummary } from '../context/course-context'
import { progressService } from './progressService'

interface RegisteredUser {
  id: string
  name: string
  email: string
  role: 'teacher' | 'student'
}

interface StoredProfile {
  avatarBase64: string | null
}

export interface TeacherStudentRow {
  id: string
  studentId: string
  studentName: string
  email: string
  avatarBase64: string | null
  courseId: string
  courseTitle: string
  teacherName: string
  moduleAssigned: string
  enrollmentTimestamp: string
  status: 'Active' | 'Pending' | 'Completed' | 'Inactive'
  progressPercent: number
  videoWatchedPercent: number
  assignmentsSubmitted: number
  assignmentsTotal: number
  quizzesCompleted: number
  quizzesTotal: number
  lastActiveAt: string | null
  assignmentProgressLabel: string
}

export interface TeacherStudentSnapshot {
  rows: TeacherStudentRow[]
  activeCount: number
  pendingCount: number
  completedCount: number
  averageProgress: number
}

const REGISTERED_USERS_KEY = 'mentoro_registered_users'
const COURSES_KEY = 'mentoro_courses'
const PROGRESS_KEY = 'mentoro_progress_records'
const PROFILE_KEY = 'mentoro_profile_'
const CHANNEL_NAME = 'mentoro_teacher_students_changed'

const safeParse = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const getRegisteredStudents = () =>
  safeParse<RegisteredUser[]>(REGISTERED_USERS_KEY, []).filter((user) => user.role === 'student')

const getTeacherName = () =>
  safeParse<RegisteredUser[]>(REGISTERED_USERS_KEY, []).find((user) => user.role === 'teacher')?.name ?? 'Assigned teacher'

const getPublishedCourses = () =>
  safeParse<CourseSummary[]>(COURSES_KEY, []).filter((course) => course.published)

const getProfile = (studentId: string) =>
  safeParse<StoredProfile>(PROFILE_KEY + studentId, { avatarBase64: null })

const getEnrollmentTimestamp = (studentId: string) => {
  const numeric = Number(studentId.replace(/^\D+/, ''))
  return Number.isFinite(numeric) && numeric > 0 ? new Date(numeric).toISOString() : ''
}

const getLastActive = (course: CourseSummary, studentId: string) => {
  const record = progressService.getRecord(studentId, course.id)
  const lastLesson = Object.values(record.lessons).sort(
    (a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()
  )[0]
  return lastLesson?.lastAccessedAt ?? record.activities[0]?.createdAt ?? null
}

const isRecentlyActive = (value: string | null) => {
  if (!value) return false
  return Date.now() - new Date(value).getTime() < 1000 * 60 * 60 * 24 * 7
}

const getStatus = (progressPercent: number, lastActiveAt: string | null): TeacherStudentRow['status'] => {
  if (progressPercent >= 100) return 'Completed'
  if (isRecentlyActive(lastActiveAt)) return 'Active'
  if (lastActiveAt) return 'Inactive'
  return 'Pending'
}

const getModuleAssigned = (course: CourseSummary, studentId: string) => {
  const summary = progressService.summarizeCourse(course, studentId)
  const activeLesson = summary.lastAccessedLessonId
    ? course.videos.find((video) => video.id === summary.lastAccessedLessonId)
    : course.videos[0]
  return activeLesson?.title ?? 'Course overview'
}

const readRows = (): TeacherStudentRow[] => {
  const students = getRegisteredStudents()
  const courses = getPublishedCourses()
  const teacherName = getTeacherName()

  return students.flatMap((student) =>
    courses.map((course) => {
      const summary = progressService.summarizeCourse(course, student.id)
      const lastActiveAt = getLastActive(course, student.id)
      const status = getStatus(summary.percent, lastActiveAt)
      return {
        id: `${student.id}:${course.id}`,
        studentId: student.id,
        studentName: student.name,
        email: student.email,
        avatarBase64: getProfile(student.id).avatarBase64,
        courseId: course.id,
        courseTitle: course.title,
        teacherName,
        moduleAssigned: getModuleAssigned(course, student.id),
        enrollmentTimestamp: getEnrollmentTimestamp(student.id),
        status,
        progressPercent: summary.percent,
        videoWatchedPercent: summary.videosPercent,
        assignmentsSubmitted: summary.submittedAssignments,
        assignmentsTotal: summary.totalAssignments,
        quizzesCompleted: summary.completedQuizzes,
        quizzesTotal: summary.totalQuizzes,
        lastActiveAt,
        assignmentProgressLabel: `${summary.submittedAssignments}/${summary.totalAssignments} submitted`,
      }
    })
  ).sort((a, b) => {
    const aTime = a.lastActiveAt || a.enrollmentTimestamp || ''
    const bTime = b.lastActiveAt || b.enrollmentTimestamp || ''
    return new Date(bTime).getTime() - new Date(aTime).getTime()
  })
}

export const teacherStudentService = {
  subscribe: (onChange: () => void) => {
    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel(CHANNEL_NAME)
      channel.onmessage = onChange
    } catch {
      channel = null
    }

    const localHandler = () => onChange()
    const storageHandler = (event: StorageEvent) => {
      if (
        event.key === REGISTERED_USERS_KEY ||
        event.key === COURSES_KEY ||
        event.key === PROGRESS_KEY ||
        event.key?.startsWith(PROFILE_KEY) ||
        event.key === 'mentoro_lesson_assessments'
      ) {
        onChange()
      }
    }
    const forwardHandler = () => {
      window.dispatchEvent(new CustomEvent(CHANNEL_NAME))
      try {
        const realtime = new BroadcastChannel(CHANNEL_NAME)
        realtime.postMessage({ type: 'changed' })
        realtime.close()
      } catch {
        // Same-tab event still keeps the page fresh.
      }
    }

    window.addEventListener(CHANNEL_NAME, localHandler)
    window.addEventListener('storage', storageHandler)
    window.addEventListener('mentoro_registered_users_changed', forwardHandler)
    window.addEventListener('mentoro_progress_changed', forwardHandler)
    window.addEventListener('mentoro_lesson_assessments_changed', forwardHandler)

    return () => {
      channel?.close()
      window.removeEventListener(CHANNEL_NAME, localHandler)
      window.removeEventListener('storage', storageHandler)
      window.removeEventListener('mentoro_registered_users_changed', forwardHandler)
      window.removeEventListener('mentoro_progress_changed', forwardHandler)
      window.removeEventListener('mentoro_lesson_assessments_changed', forwardHandler)
    }
  },

  fetchSnapshot: async (): Promise<TeacherStudentSnapshot> => {
    await new Promise((resolve) => setTimeout(resolve, 120))
    const rows = readRows()
    return {
      rows,
      activeCount: rows.filter((row) => row.status === 'Active').length,
      pendingCount: rows.filter((row) => row.status === 'Pending').length,
      completedCount: rows.filter((row) => row.status === 'Completed').length,
      averageProgress: rows.length
        ? Math.round(rows.reduce((sum, row) => sum + row.progressPercent, 0) / rows.length)
        : 0,
    }
  },
}
