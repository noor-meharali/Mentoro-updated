import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from './useAuth'
import { useNotificationContext } from './useNotifications'
import {
  lessonAssessmentService,
  type AnswerValue,
  type AssignmentDraft,
  type AssignmentSubmission,
  type LessonAssessmentState,
  type QuizDraft,
} from '../services/lessonAssessmentService'

const emptyState: LessonAssessmentState = { quizzes: [], attempts: [], assignments: [], submissions: [] }

export const useLessonAssessment = (courseId: string, lessonId: string, lessonTitle: string) => {
  const { user } = useAuth()
  const { addNotification } = useNotificationContext()
  const [state, setState] = useState<LessonAssessmentState>(emptyState)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    lessonAssessmentService.fetchLesson(courseId, lessonId)
      .then((next) => {
        if (active) setState(next)
      })
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to load assessments.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    const unsubscribe = lessonAssessmentService.subscribe(() => {
      lessonAssessmentService.fetchLesson(courseId, lessonId).then(setState).catch(() => undefined)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [courseId, lessonId])

  const requireUser = useCallback(() => {
    if (!user) throw new Error('Please sign in to use assessments.')
    return user
  }, [user])

  const run = useCallback(
    async (
      action: () => LessonAssessmentState | Promise<LessonAssessmentState>,
      notification?: { title: string; description: string }
    ) => {
      setSaving(true)
      setError(null)
      try {
        const next = await action()
        setState(next)
        if (notification) addNotification(notification)
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to update assessments.')
      } finally {
        setSaving(false)
      }
    },
    [addNotification]
  )

  return useMemo(
    () => ({
      ...state,
      loading,
      saving,
      error,
      currentUser: user,
      clearError: () => setError(null),
      saveQuiz: (draft: QuizDraft, quizId?: string) => run(
        () => lessonAssessmentService.saveQuiz(courseId, lessonId, requireUser(), draft, quizId)
      ),
      deleteQuiz: (quizId: string) => run(
        () => lessonAssessmentService.deleteQuiz(courseId, lessonId, requireUser(), quizId)
      ),
      duplicateQuiz: (quizId: string) => run(
        () => lessonAssessmentService.duplicateQuiz(courseId, lessonId, requireUser(), quizId)
      ),
      toggleQuizPublish: (quizId: string) => run(
        () => lessonAssessmentService.toggleQuizPublish(courseId, lessonId, requireUser(), quizId),
        {
          title: 'Quiz availability updated',
          description: `A quiz changed status in ${lessonTitle}.`,
        }
      ),
      startAttempt: (quizId: string) => run(
        () => lessonAssessmentService.startAttempt(courseId, lessonId, requireUser(), quizId)
      ),
      saveAttemptAnswer: (attemptId: string, questionId: string, answer: AnswerValue, durationSeconds: number) => run(
        () => lessonAssessmentService.saveAttemptAnswer(courseId, lessonId, requireUser(), attemptId, questionId, answer, durationSeconds)
      ),
      toggleMarkForReview: (attemptId: string, questionId: string) => run(
        () => lessonAssessmentService.toggleMarkForReview(courseId, lessonId, requireUser(), attemptId, questionId)
      ),
      submitAttempt: (attemptId: string, durationSeconds: number) => run(
        () => lessonAssessmentService.submitAttempt(courseId, lessonId, requireUser(), attemptId, durationSeconds),
        {
          title: 'Quiz results available',
          description: `A quiz attempt was submitted in ${lessonTitle}.`,
        }
      ),
      saveAssignment: (draft: AssignmentDraft, assignmentId?: string) => run(
        () => lessonAssessmentService.saveAssignment(courseId, lessonId, requireUser(), draft, assignmentId)
      ),
      deleteAssignment: (assignmentId: string) => run(
        () => lessonAssessmentService.deleteAssignment(courseId, lessonId, requireUser(), assignmentId)
      ),
      submitAssignment: (assignmentId: string, note: string, files: File[]) => run(
        () => lessonAssessmentService.submitAssignment(courseId, lessonId, requireUser(), assignmentId, note, files),
        {
          title: 'Assignment submitted',
          description: `A submission was added in ${lessonTitle}.`,
        }
      ),
      reviewSubmission: (
        submissionId: string,
        status: AssignmentSubmission['status'],
        marks: number,
        feedback: string
      ) => run(
        () => lessonAssessmentService.reviewSubmission(courseId, lessonId, requireUser(), submissionId, status, marks, feedback),
        {
          title: 'Teacher feedback added',
          description: `Feedback is available for ${lessonTitle}.`,
        }
      ),
    }),
    [courseId, error, lessonId, lessonTitle, loading, requireUser, run, saving, state, user]
  )
}
