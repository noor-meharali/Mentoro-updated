import { useCallback, useEffect, useMemo, useState } from 'react'
import { lessonDiscussionService, type LessonDiscussionState } from '../services/lessonDiscussionService'
import { useAuth } from './useAuth'
import { useNotificationContext } from './useNotifications'

const emptyState: LessonDiscussionState = { comments: [], questions: [] }

export const useLessonDiscussion = (courseId: string, lessonId: string, lessonTitle: string) => {
  const { user } = useAuth()
  const { addNotification } = useNotificationContext()
  const [state, setState] = useState<LessonDiscussionState>(emptyState)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    lessonDiscussionService.fetchLesson(courseId, lessonId)
      .then((next) => {
        if (active) setState(next)
      })
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to load discussion.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    const unsubscribe = lessonDiscussionService.subscribe(() => {
      lessonDiscussionService.fetchLesson(courseId, lessonId).then(setState).catch(() => undefined)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [courseId, lessonId])

  const requireUser = useCallback(() => {
    if (!user) throw new Error('Please sign in to join this discussion.')
    return user
  }, [user])

  const run = useCallback(
    (action: () => LessonDiscussionState, notification?: { title: string; description: string }) => {
      try {
        setError(null)
        const next = action()
        setState(next)
        if (notification) addNotification(notification)
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to update discussion.')
      }
    },
    [addNotification]
  )

  return useMemo(
    () => ({
      ...state,
      loading,
      error,
      currentUser: user,
      clearError: () => setError(null),
      addComment: (body: string) => run(
        () => lessonDiscussionService.createComment(courseId, lessonId, requireUser(), body)
      ),
      editComment: (commentId: string, body: string) => run(
        () => lessonDiscussionService.updateComment(courseId, lessonId, requireUser(), commentId, body)
      ),
      deleteComment: (commentId: string) => run(
        () => lessonDiscussionService.deleteComment(courseId, lessonId, requireUser(), commentId)
      ),
      togglePinComment: (commentId: string) => run(
        () => lessonDiscussionService.togglePinComment(courseId, lessonId, requireUser(), commentId)
      ),
      toggleCommentLike: (commentId: string) => run(
        () => lessonDiscussionService.toggleCommentLike(courseId, lessonId, requireUser(), commentId)
      ),
      addReply: (commentId: string, body: string) => run(
        () => lessonDiscussionService.createReply(courseId, lessonId, requireUser(), commentId, body),
        {
          title: 'New lesson reply',
          description: `A reply was added in ${lessonTitle}.`,
        }
      ),
      addQuestion: (title: string, body: string) => run(
        () => lessonDiscussionService.createQuestion(courseId, lessonId, requireUser(), title, body)
      ),
      editQuestion: (questionId: string, title: string, body: string) => run(
        () => lessonDiscussionService.updateQuestion(courseId, lessonId, requireUser(), questionId, title, body)
      ),
      deleteQuestion: (questionId: string) => run(
        () => lessonDiscussionService.deleteQuestion(courseId, lessonId, requireUser(), questionId)
      ),
      addAnswer: (questionId: string, body: string) => run(
        () => lessonDiscussionService.createAnswer(courseId, lessonId, requireUser(), questionId, body),
        {
          title: 'New question answer',
          description: `A question was answered in ${lessonTitle}.`,
        }
      ),
      toggleAnswerUpvote: (questionId: string, answerId: string) => run(
        () => lessonDiscussionService.toggleAnswerUpvote(courseId, lessonId, requireUser(), questionId, answerId)
      ),
      toggleAcceptedAnswer: (questionId: string, answerId: string) => run(
        () => lessonDiscussionService.toggleAcceptedAnswer(courseId, lessonId, requireUser(), questionId, answerId)
      ),
      toggleHighlightedAnswer: (questionId: string, answerId: string) => run(
        () => lessonDiscussionService.toggleHighlightedAnswer(courseId, lessonId, requireUser(), questionId, answerId)
      ),
    }),
    [courseId, error, lessonId, lessonTitle, loading, requireUser, run, state, user]
  )
}
