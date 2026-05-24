import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CourseSummary } from '../context/course-context'
import { progressService, type CourseProgressSettings, type CourseProgressSummary } from '../services/progressService'
import { useAuth } from './useAuth'
import { useNotificationContext } from './useNotifications'

export const useCourseProgress = (course: CourseSummary | null) => {
  const { user } = useAuth()
  const { addNotification } = useNotificationContext()
  const [version, setVersion] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => progressService.subscribe(() => setVersion((value) => value + 1)), [])

  const summary = useMemo(() => {
    void version
    if (!course || !user) return null
    return progressService.summarizeCourse(course, user.id)
  }, [course, user, version])

  const trackVideoWatch = useCallback(
    (lessonId: string, title: string, currentSeconds: number, durationSeconds: number) => {
      if (!user || !course) return
      try {
        const before = progressService.summarizeCourse(course, user.id).percent
        progressService.trackVideoWatch(user, course.id, lessonId, title, currentSeconds, durationSeconds)
        const after = progressService.summarizeCourse(course, user.id).percent
        if (before < 100 && after === 100) {
          addNotification({ title: 'Course completed', description: `${course.title} is now complete.` })
        }
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to save progress.')
      }
    },
    [addNotification, course, user]
  )

  const markLessonComplete = useCallback(
    (lessonId: string, title: string) => {
      if (!user || !course) return
      try {
        progressService.markLessonComplete(user, course.id, lessonId, title)
        addNotification({ title: 'Lesson completed', description: `${title} was marked complete.` })
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to complete lesson.')
      }
    },
    [addNotification, course, user]
  )

  const trackResourceView = useCallback(
    (lessonId: string, resourceId: string, title: string) => {
      if (!user || !course) return
      try {
        progressService.trackResourceView(user, course.id, lessonId, resourceId, title)
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to save resource progress.')
      }
    },
    [course, user]
  )

  const updateSettings = useCallback(
    (settings: CourseProgressSettings) => {
      if (!user || !course) return
      try {
        progressService.updateSettings(user, course.id, settings)
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to update progress settings.')
      }
    },
    [course, user]
  )

  return {
    summary,
    error,
    clearError: () => setError(null),
    trackVideoWatch,
    markLessonComplete,
    trackResourceView,
    updateSettings,
  }
}

export const useProgressOverview = (courses: CourseSummary[]) => {
  const { user } = useAuth()
  const [version, setVersion] = useState(0)

  useEffect(() => progressService.subscribe(() => setVersion((value) => value + 1)), [])

  const summaries = useMemo<CourseProgressSummary[]>(() => {
    void version
    if (!user) return []
    return progressService.summarizeAll(courses, user.id)
  }, [courses, user, version])

  const overallPercent = summaries.length
    ? Math.round(summaries.reduce((sum, item) => sum + item.percent, 0) / summaries.length)
    : 0
  const completedLessons = summaries.reduce((sum, item) => sum + item.completedLessons, 0)
  const totalLessons = summaries.reduce((sum, item) => sum + item.totalLessons, 0)
  const timeSpentSeconds = summaries.reduce((sum, item) => sum + item.timeSpentSeconds, 0)
  const streakDays = Math.max(0, ...summaries.map((item) => item.streakDays))
  const recentActivities = summaries.flatMap((item) => item.activities).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 8)
  const continueCourse = [...summaries].sort((a, b) => b.percent - a.percent).find((item) => item.percent < 100) ?? summaries[0] ?? null

  return {
    summaries,
    overallPercent,
    completedLessons,
    totalLessons,
    remainingLessons: Math.max(0, totalLessons - completedLessons),
    timeSpentSeconds,
    streakDays,
    recentActivities,
    continueCourse,
  }
}

export const useTeacherProgressAnalytics = (courses: CourseSummary[]) => {
  const [version, setVersion] = useState(0)

  useEffect(() => progressService.subscribe(() => setVersion((value) => value + 1)), [])

  return useMemo(() => {
    void version
    return progressService.summarizeTeacherAnalytics(courses)
  }, [courses, version])
}
