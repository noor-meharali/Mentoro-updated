import type { CourseSummary } from '../context/course-context'
import type { UserProfile } from '../context/auth-context'

export interface VideoProgressRecord {
  lessonId: string
  durationSeconds: number
  maxWatchedSeconds: number
  lastPositionSeconds: number
  watchPercent: number
  completed: boolean
  completedAt: string | null
  updatedAt: string
}

export interface LessonProgressRecord {
  lessonId: string
  manualComplete: boolean
  completedAt: string | null
  resourcesViewed: string[]
  timeSpentSeconds: number
  lastAccessedAt: string
}

export interface LearningActivityLog {
  id: string
  type: 'video_watch' | 'lesson_complete' | 'resource_view' | 'quiz_submit' | 'assignment_submit'
  courseId: string
  lessonId: string
  userId: string
  title: string
  createdAt: string
  secondsSpent?: number
}

export interface CourseProgressSettings {
  requiredWatchPercent: number
  weights: {
    videos: number
    quizzes: number
    assignments: number
    resources: number
  }
}

export interface CourseProgressRecord {
  userId: string
  courseId: string
  videos: Record<string, VideoProgressRecord>
  lessons: Record<string, LessonProgressRecord>
  settings: CourseProgressSettings
  activities: LearningActivityLog[]
  updatedAt: string
}

export interface LessonProgressSummary {
  lessonId: string
  title: string
  videoPercent: number
  completed: boolean
  lastPositionSeconds: number
  resourcesViewed: number
  totalResources: number
  timeSpentSeconds: number
}

export interface CourseProgressSummary {
  courseId: string
  title: string
  percent: number
  videosPercent: number
  quizzesPercent: number
  assignmentsPercent: number
  resourcesPercent: number
  completedLessons: number
  totalLessons: number
  remainingLessons: number
  completedQuizzes: number
  totalQuizzes: number
  submittedAssignments: number
  totalAssignments: number
  viewedResources: number
  totalResources: number
  timeSpentSeconds: number
  streakDays: number
  lastAccessedLessonId: string | null
  lastAccessedTitle: string | null
  estimatedMinutesRemaining: number
  lessons: LessonProgressSummary[]
  activities: LearningActivityLog[]
}

export interface TeacherProgressAnalytics {
  trackedStudents: number
  averageProgress: number
  completedLessons: number
  timeSpentSeconds: number
  courseRows: Array<{ courseId: string; title: string; students: number; averageProgress: number }>
}

const STORAGE_KEY = 'mentoro_progress_records'
const ASSESSMENTS_KEY = 'mentoro_lesson_assessments'
const CHANNEL_NAME = 'mentoro_progress_changed'

type ProgressStore = Record<string, CourseProgressRecord>

interface AssessmentSlice {
  attempts?: Array<{ quizId: string; studentId: string; submittedAt: string | null }>
  quizzes?: Array<{ id: string; published: boolean }>
  assignments?: Array<{ id: string; published: boolean }>
  submissions?: Array<{ assignmentId: string; studentId: string }>
}

const defaultSettings = (): CourseProgressSettings => ({
  requiredWatchPercent: 80,
  weights: { videos: 40, quizzes: 30, assignments: 20, resources: 10 },
})

const keyFor = (userId: string, courseId: string) => `${userId}:${courseId}`
const now = () => new Date().toISOString()
const uid = () => `activity_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

const safeParse = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const getStore = () => safeParse<ProgressStore>(STORAGE_KEY, {})

const writeStore = (store: ProgressStore) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  window.dispatchEvent(new CustomEvent(CHANNEL_NAME))
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME)
    channel.postMessage({ type: 'changed' })
    channel.close()
  } catch {
    // BroadcastChannel is progressive enhancement for cross-tab realtime sync.
  }
}

const emptyRecord = (userId: string, courseId: string): CourseProgressRecord => ({
  userId,
  courseId,
  videos: {},
  lessons: {},
  settings: defaultSettings(),
  activities: [],
  updatedAt: now(),
})

const withRecord = (
  user: UserProfile,
  courseId: string,
  updater: (record: CourseProgressRecord) => CourseProgressRecord
) => {
  const store = getStore()
  const key = keyFor(user.id, courseId)
  const current = store[key] ?? emptyRecord(user.id, courseId)
  const next = updater(current)
  store[key] = { ...next, updatedAt: now() }
  writeStore(store)
  return store[key]
}

const addActivity = (
  record: CourseProgressRecord,
  activity: Omit<LearningActivityLog, 'id' | 'userId' | 'createdAt'>
) => ({
  ...record,
  activities: [
    {
      id: uid(),
      userId: record.userId,
      createdAt: now(),
      ...activity,
    },
    ...record.activities,
  ].slice(0, 80),
})

const readAssessmentSlice = (courseId: string, lessonId: string): AssessmentSlice => {
  const store = safeParse<Record<string, AssessmentSlice>>(ASSESSMENTS_KEY, {})
  return store[`${courseId}:${lessonId}`] ?? {}
}

const percent = (done: number, total: number) => total > 0 ? Math.round((done / total) * 100) : 100

const activeWeightTotal = (
  weights: CourseProgressSettings['weights'],
  totals: { videos: number; quizzes: number; assignments: number; resources: number }
) =>
  (totals.videos > 0 ? weights.videos : 0) +
  (totals.quizzes > 0 ? weights.quizzes : 0) +
  (totals.assignments > 0 ? weights.assignments : 0) +
  (totals.resources > 0 ? weights.resources : 0)

const learningDays = (activities: LearningActivityLog[]) =>
  new Set(activities.map((activity) => activity.createdAt.slice(0, 10))).size

export const progressService = {
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
      if (event.key === STORAGE_KEY || event.key === ASSESSMENTS_KEY) onChange()
    }
    const assessmentHandler = () => onChange()

    window.addEventListener(CHANNEL_NAME, localHandler)
    window.addEventListener('storage', storageHandler)
    window.addEventListener('mentoro_lesson_assessments_changed', assessmentHandler)

    return () => {
      channel?.close()
      window.removeEventListener(CHANNEL_NAME, localHandler)
      window.removeEventListener('storage', storageHandler)
      window.removeEventListener('mentoro_lesson_assessments_changed', assessmentHandler)
    }
  },

  getRecord: (userId: string, courseId: string) =>
    getStore()[keyFor(userId, courseId)] ?? emptyRecord(userId, courseId),

  updateSettings: (user: UserProfile, courseId: string, settings: CourseProgressSettings) => {
    if (user.role !== 'teacher') throw new Error('Only teachers can configure completion rules.')
    return withRecord(user, courseId, (record) => ({ ...record, settings }))
  },

  trackVideoWatch: (
    user: UserProfile,
    courseId: string,
    lessonId: string,
    title: string,
    currentSeconds: number,
    durationSeconds: number
  ) => {
    if (user.role !== 'student') return progressService.getRecord(user.id, courseId)
    return withRecord(user, courseId, (record) => {
      const previous = record.videos[lessonId]
      const safeDuration = Math.max(1, Math.floor(durationSeconds || previous?.durationSeconds || 1))
      const safeCurrent = Math.max(0, Math.min(Math.floor(currentSeconds), safeDuration))
      const maxWatchedSeconds = Math.max(previous?.maxWatchedSeconds ?? 0, safeCurrent)
      const watchPercent = Math.min(100, Math.round((maxWatchedSeconds / safeDuration) * 100))
      const completed = watchPercent >= record.settings.requiredWatchPercent
      const videoRecord: VideoProgressRecord = {
        lessonId,
        durationSeconds: safeDuration,
        maxWatchedSeconds,
        lastPositionSeconds: safeCurrent,
        watchPercent,
        completed,
        completedAt: completed ? previous?.completedAt ?? now() : null,
        updatedAt: now(),
      }
      const lesson = record.lessons[lessonId] ?? {
        lessonId,
        manualComplete: false,
        completedAt: null,
        resourcesViewed: [],
        timeSpentSeconds: 0,
        lastAccessedAt: now(),
      }
      const next = {
        ...record,
        videos: { ...record.videos, [lessonId]: videoRecord },
        lessons: {
          ...record.lessons,
          [lessonId]: {
            ...lesson,
            timeSpentSeconds: lesson.timeSpentSeconds + 1,
            lastAccessedAt: now(),
            completedAt: completed ? lesson.completedAt ?? now() : lesson.completedAt,
          },
        },
      }
      return completed && !previous?.completed
        ? addActivity(next, { type: 'lesson_complete', courseId, lessonId, title })
        : next
    })
  },

  markLessonComplete: (user: UserProfile, courseId: string, lessonId: string, title: string) => {
    if (user.role !== 'student') throw new Error('Only students can mark lesson progress.')
    return withRecord(user, courseId, (record) => {
      const lesson = record.lessons[lessonId] ?? {
        lessonId,
        manualComplete: false,
        completedAt: null,
        resourcesViewed: [],
        timeSpentSeconds: 0,
        lastAccessedAt: now(),
      }
      const next = {
        ...record,
        lessons: {
          ...record.lessons,
          [lessonId]: {
            ...lesson,
            manualComplete: true,
            completedAt: lesson.completedAt ?? now(),
            lastAccessedAt: now(),
          },
        },
      }
      return addActivity(next, { type: 'lesson_complete', courseId, lessonId, title })
    })
  },

  trackResourceView: (user: UserProfile, courseId: string, lessonId: string, resourceId: string, title: string) => {
    if (user.role !== 'student') return progressService.getRecord(user.id, courseId)
    return withRecord(user, courseId, (record) => {
      const lesson = record.lessons[lessonId] ?? {
        lessonId,
        manualComplete: false,
        completedAt: null,
        resourcesViewed: [],
        timeSpentSeconds: 0,
        lastAccessedAt: now(),
      }
      if (lesson.resourcesViewed.includes(resourceId)) return record
      const next = {
        ...record,
        lessons: {
          ...record.lessons,
          [lessonId]: {
            ...lesson,
            resourcesViewed: [...lesson.resourcesViewed, resourceId],
            lastAccessedAt: now(),
          },
        },
      }
      return addActivity(next, { type: 'resource_view', courseId, lessonId, title })
    })
  },

  summarizeCourse: (course: CourseSummary, userId: string): CourseProgressSummary => {
    const record = progressService.getRecord(userId, course.id)
    const videos = course.videos ?? []
    const resources = [...(course.documents ?? []), ...(course.images ?? [])]
    const assessmentSlices = videos.map((video) => readAssessmentSlice(course.id, video.id))
    const quizzes = assessmentSlices.flatMap((slice) => slice.quizzes ?? []).filter((quiz) => quiz.published)
    const assignments = assessmentSlices.flatMap((slice) => slice.assignments ?? []).filter((assignment) => assignment.published)
    const attempts = assessmentSlices.flatMap((slice) => slice.attempts ?? [])
    const submissions = assessmentSlices.flatMap((slice) => slice.submissions ?? [])

    const completedVideos = videos.filter((video) => {
      const videoRecord = record.videos[video.id]
      const lessonRecord = record.lessons[video.id]
      return videoRecord?.completed || lessonRecord?.manualComplete
    }).length
    const completedQuizzes = quizzes.filter((quiz) =>
      attempts.some((attempt) => attempt.quizId === quiz.id && attempt.studentId === userId && !!attempt.submittedAt)
    ).length
    const submittedAssignments = assignments.filter((assignment) =>
      submissions.some((submission) => submission.assignmentId === assignment.id && submission.studentId === userId)
    ).length
    const viewedResources = resources.filter((resource) =>
      Object.values(record.lessons).some((lesson) => lesson.resourcesViewed.includes(resource.id))
    ).length

    const sectionPercents = {
      videos: percent(completedVideos, videos.length),
      quizzes: percent(completedQuizzes, quizzes.length),
      assignments: percent(submittedAssignments, assignments.length),
      resources: percent(viewedResources, resources.length),
    }
    const totals = { videos: videos.length, quizzes: quizzes.length, assignments: assignments.length, resources: resources.length }
    const activeTotal = activeWeightTotal(record.settings.weights, totals) || 1
    const weighted =
      (totals.videos > 0 ? sectionPercents.videos * record.settings.weights.videos : 0) +
      (totals.quizzes > 0 ? sectionPercents.quizzes * record.settings.weights.quizzes : 0) +
      (totals.assignments > 0 ? sectionPercents.assignments * record.settings.weights.assignments : 0) +
      (totals.resources > 0 ? sectionPercents.resources * record.settings.weights.resources : 0)

    const lessons = videos.map((video) => {
      const lesson = record.lessons[video.id]
      const videoRecord = record.videos[video.id]
      const totalLessonResources = 0
      return {
        lessonId: video.id,
        title: video.title,
        videoPercent: videoRecord?.watchPercent ?? 0,
        completed: Boolean(videoRecord?.completed || lesson?.manualComplete),
        lastPositionSeconds: videoRecord?.lastPositionSeconds ?? 0,
        resourcesViewed: lesson?.resourcesViewed.length ?? 0,
        totalResources: totalLessonResources,
        timeSpentSeconds: lesson?.timeSpentSeconds ?? 0,
      }
    })

    const lastLesson = [...Object.values(record.lessons)].sort(
      (a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()
    )[0]
    const lastAccessedTitle = lastLesson ? videos.find((video) => video.id === lastLesson.lessonId)?.title ?? null : null
    const timeSpentSeconds = Object.values(record.lessons).reduce((sum, lesson) => sum + lesson.timeSpentSeconds, 0)

    return {
      courseId: course.id,
      title: course.title,
      percent: Math.min(100, Math.round(weighted / activeTotal)),
      videosPercent: sectionPercents.videos,
      quizzesPercent: sectionPercents.quizzes,
      assignmentsPercent: sectionPercents.assignments,
      resourcesPercent: sectionPercents.resources,
      completedLessons: completedVideos,
      totalLessons: videos.length,
      remainingLessons: Math.max(0, videos.length - completedVideos),
      completedQuizzes,
      totalQuizzes: quizzes.length,
      submittedAssignments,
      totalAssignments: assignments.length,
      viewedResources,
      totalResources: resources.length,
      timeSpentSeconds,
      streakDays: learningDays(record.activities),
      lastAccessedLessonId: lastLesson?.lessonId ?? null,
      lastAccessedTitle,
      estimatedMinutesRemaining: Math.max(0, (videos.length - completedVideos) * 12),
      lessons,
      activities: record.activities,
    }
  },

  summarizeAll: (courses: CourseSummary[], userId: string) =>
    courses.map((course) => progressService.summarizeCourse(course, userId)),

  summarizeTeacherAnalytics: (courses: CourseSummary[]): TeacherProgressAnalytics => {
    const store = getStore()
    const records = Object.values(store).filter((record) => courses.some((course) => course.id === record.courseId))
    const courseRows = courses.map((course) => {
      const courseRecords = records.filter((record) => record.courseId === course.id)
      const summaries = courseRecords.map((record) => progressService.summarizeCourse(course, record.userId))
      return {
        courseId: course.id,
        title: course.title,
        students: courseRecords.length,
        averageProgress: summaries.length
          ? Math.round(summaries.reduce((sum, summary) => sum + summary.percent, 0) / summaries.length)
          : 0,
      }
    })
    const summaries = records.map((record) => {
      const course = courses.find((item) => item.id === record.courseId)
      return course ? progressService.summarizeCourse(course, record.userId) : null
    }).filter((summary): summary is CourseProgressSummary => Boolean(summary))

    return {
      trackedStudents: new Set(records.map((record) => record.userId)).size,
      averageProgress: summaries.length
        ? Math.round(summaries.reduce((sum, summary) => sum + summary.percent, 0) / summaries.length)
        : 0,
      completedLessons: summaries.reduce((sum, summary) => sum + summary.completedLessons, 0),
      timeSpentSeconds: summaries.reduce((sum, summary) => sum + summary.timeSpentSeconds, 0),
      courseRows,
    }
  },
}
