import type { UserProfile } from '../context/auth-context'

export type DiscussionRole = UserProfile['role'] | 'admin'

export interface DiscussionAuthor {
  id: string
  name: string
  role: DiscussionRole
  avatarInitials: string
}

export interface LessonReply {
  id: string
  body: string
  author: DiscussionAuthor
  createdAt: string
  updatedAt: string | null
}

export interface LessonComment {
  id: string
  courseId: string
  lessonId: string
  body: string
  author: DiscussionAuthor
  createdAt: string
  updatedAt: string | null
  pinned: boolean
  likes: string[]
  replies: LessonReply[]
}

export interface LessonAnswer {
  id: string
  body: string
  author: DiscussionAuthor
  createdAt: string
  updatedAt: string | null
  accepted: boolean
  highlighted: boolean
  upvotes: string[]
}

export interface LessonQuestion {
  id: string
  courseId: string
  lessonId: string
  title: string
  body: string
  author: DiscussionAuthor
  createdAt: string
  updatedAt: string | null
  answers: LessonAnswer[]
}

export interface LessonDiscussionState {
  comments: LessonComment[]
  questions: LessonQuestion[]
}

const STORAGE_KEY = 'mentoro_lesson_discussions'
const CHANNEL_NAME = 'mentoro_lesson_discussions_changed'
const MAX_BODY_LENGTH = 1200
const MAX_TITLE_LENGTH = 140

type DiscussionStore = Record<string, LessonDiscussionState>

const emptyState = (): LessonDiscussionState => ({ comments: [], questions: [] })

const keyFor = (courseId: string, lessonId: string) => `${courseId}:${lessonId}`

const safeParse = (): DiscussionStore => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const writeStore = (store: DiscussionStore) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  window.dispatchEvent(new CustomEvent(CHANNEL_NAME))
  try {
    new BroadcastChannel(CHANNEL_NAME).postMessage({ type: 'changed' })
  } catch {
    // BroadcastChannel is optional; the custom event keeps same-tab updates live.
  }
}

const withStore = (
  courseId: string,
  lessonId: string,
  updater: (state: LessonDiscussionState) => LessonDiscussionState
): LessonDiscussionState => {
  const store = safeParse()
  const key = keyFor(courseId, lessonId)
  const current = store[key] ?? emptyState()
  const next = updater(current)
  store[key] = next
  writeStore(store)
  return next
}

const ensureBody = (value: string, label = 'Message') => {
  const body = value.trim()
  if (body.length < 2) throw new Error(`${label} must be at least 2 characters.`)
  if (body.length > MAX_BODY_LENGTH) throw new Error(`${label} must be ${MAX_BODY_LENGTH} characters or less.`)
  return body
}

const ensureTitle = (value: string) => {
  const title = value.trim()
  if (title.length < 4) throw new Error('Question title must be at least 4 characters.')
  if (title.length > MAX_TITLE_LENGTH) throw new Error(`Question title must be ${MAX_TITLE_LENGTH} characters or less.`)
  return title
}

const authorFromUser = (user: UserProfile): DiscussionAuthor => {
  const words = user.name.trim().split(/\s+/).filter(Boolean)
  const initials = words.length > 1 ? `${words[0][0]}${words[1][0]}` : user.name.slice(0, 2)
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    avatarInitials: initials.toUpperCase(),
  }
}

const canModerate = (user: UserProfile) => user.role === 'teacher'
const canOwn = (user: UserProfile, authorId: string) => user.id === authorId || canModerate(user)
const uid = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
const now = () => new Date().toISOString()

export const lessonDiscussionService = {
  subscribe: (onChange: () => void) => {
    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel(CHANNEL_NAME)
      channel.onmessage = onChange
    } catch {
      channel = null
    }

    const storageHandler = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) onChange()
    }
    const localHandler = () => onChange()

    window.addEventListener('storage', storageHandler)
    window.addEventListener(CHANNEL_NAME, localHandler)

    return () => {
      channel?.close()
      window.removeEventListener('storage', storageHandler)
      window.removeEventListener(CHANNEL_NAME, localHandler)
    }
  },

  fetchLesson: async (courseId: string, lessonId: string): Promise<LessonDiscussionState> => {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return safeParse()[keyFor(courseId, lessonId)] ?? emptyState()
  },

  createComment: (courseId: string, lessonId: string, user: UserProfile, bodyValue: string) =>
    withStore(courseId, lessonId, (state) => ({
      ...state,
      comments: [
        {
          id: uid('comment'),
          courseId,
          lessonId,
          body: ensureBody(bodyValue, 'Comment'),
          author: authorFromUser(user),
          createdAt: now(),
          updatedAt: null,
          pinned: false,
          likes: [],
          replies: [],
        },
        ...state.comments,
      ],
    })),

  updateComment: (courseId: string, lessonId: string, user: UserProfile, commentId: string, bodyValue: string) =>
    withStore(courseId, lessonId, (state) => ({
      ...state,
      comments: state.comments.map((comment) => {
        if (comment.id !== commentId) return comment
        if (!canOwn(user, comment.author.id)) throw new Error('You do not have permission to edit this comment.')
        return { ...comment, body: ensureBody(bodyValue, 'Comment'), updatedAt: now() }
      }),
    })),

  deleteComment: (courseId: string, lessonId: string, user: UserProfile, commentId: string) =>
    withStore(courseId, lessonId, (state) => ({
      ...state,
      comments: state.comments.filter((comment) => {
        if (comment.id !== commentId) return true
        if (!canOwn(user, comment.author.id)) throw new Error('You do not have permission to delete this comment.')
        return false
      }),
    })),

  togglePinComment: (courseId: string, lessonId: string, user: UserProfile, commentId: string) =>
    withStore(courseId, lessonId, (state) => {
      if (!canModerate(user)) throw new Error('Only teachers can pin comments.')
      return {
        ...state,
        comments: state.comments.map((comment) =>
          comment.id === commentId ? { ...comment, pinned: !comment.pinned } : comment
        ),
      }
    }),

  toggleCommentLike: (courseId: string, lessonId: string, user: UserProfile, commentId: string) =>
    withStore(courseId, lessonId, (state) => ({
      ...state,
      comments: state.comments.map((comment) => {
        if (comment.id !== commentId) return comment
        const liked = comment.likes.includes(user.id)
        return { ...comment, likes: liked ? comment.likes.filter((id) => id !== user.id) : [...comment.likes, user.id] }
      }),
    })),

  createReply: (courseId: string, lessonId: string, user: UserProfile, commentId: string, bodyValue: string) =>
    withStore(courseId, lessonId, (state) => ({
      ...state,
      comments: state.comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replies: [
                ...comment.replies,
                {
                  id: uid('reply'),
                  body: ensureBody(bodyValue, 'Reply'),
                  author: authorFromUser(user),
                  createdAt: now(),
                  updatedAt: null,
                },
              ],
            }
          : comment
      ),
    })),

  createQuestion: (courseId: string, lessonId: string, user: UserProfile, titleValue: string, bodyValue: string) =>
    withStore(courseId, lessonId, (state) => ({
      ...state,
      questions: [
        {
          id: uid('question'),
          courseId,
          lessonId,
          title: ensureTitle(titleValue),
          body: ensureBody(bodyValue, 'Question'),
          author: authorFromUser(user),
          createdAt: now(),
          updatedAt: null,
          answers: [],
        },
        ...state.questions,
      ],
    })),

  updateQuestion: (
    courseId: string,
    lessonId: string,
    user: UserProfile,
    questionId: string,
    titleValue: string,
    bodyValue: string
  ) =>
    withStore(courseId, lessonId, (state) => ({
      ...state,
      questions: state.questions.map((question) => {
        if (question.id !== questionId) return question
        if (!canOwn(user, question.author.id)) throw new Error('You do not have permission to edit this question.')
        return { ...question, title: ensureTitle(titleValue), body: ensureBody(bodyValue, 'Question'), updatedAt: now() }
      }),
    })),

  deleteQuestion: (courseId: string, lessonId: string, user: UserProfile, questionId: string) =>
    withStore(courseId, lessonId, (state) => ({
      ...state,
      questions: state.questions.filter((question) => {
        if (question.id !== questionId) return true
        if (!canOwn(user, question.author.id)) throw new Error('You do not have permission to delete this question.')
        return false
      }),
    })),

  createAnswer: (courseId: string, lessonId: string, user: UserProfile, questionId: string, bodyValue: string) =>
    withStore(courseId, lessonId, (state) => ({
      ...state,
      questions: state.questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              answers: [
                ...question.answers,
                {
                  id: uid('answer'),
                  body: ensureBody(bodyValue, 'Answer'),
                  author: authorFromUser(user),
                  createdAt: now(),
                  updatedAt: null,
                  accepted: false,
                  highlighted: false,
                  upvotes: [],
                },
              ],
            }
          : question
      ),
    })),

  toggleAnswerUpvote: (courseId: string, lessonId: string, user: UserProfile, questionId: string, answerId: string) =>
    withStore(courseId, lessonId, (state) => ({
      ...state,
      questions: state.questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              answers: question.answers.map((answer) => {
                if (answer.id !== answerId) return answer
                const upvoted = answer.upvotes.includes(user.id)
                return {
                  ...answer,
                  upvotes: upvoted ? answer.upvotes.filter((id) => id !== user.id) : [...answer.upvotes, user.id],
                }
              }),
            }
          : question
      ),
    })),

  toggleAcceptedAnswer: (courseId: string, lessonId: string, user: UserProfile, questionId: string, answerId: string) =>
    withStore(courseId, lessonId, (state) => {
      if (!canModerate(user)) throw new Error('Only teachers can mark accepted answers.')
      return {
        ...state,
        questions: state.questions.map((question) =>
          question.id === questionId
            ? {
                ...question,
                answers: question.answers.map((answer) => ({
                  ...answer,
                  accepted: answer.id === answerId ? !answer.accepted : false,
                })),
              }
            : question
        ),
      }
    }),

  toggleHighlightedAnswer: (
    courseId: string,
    lessonId: string,
    user: UserProfile,
    questionId: string,
    answerId: string
  ) =>
    withStore(courseId, lessonId, (state) => {
      if (!canModerate(user)) throw new Error('Only teachers can highlight answers.')
      return {
        ...state,
        questions: state.questions.map((question) =>
          question.id === questionId
            ? {
                ...question,
                answers: question.answers.map((answer) =>
                  answer.id === answerId ? { ...answer, highlighted: !answer.highlighted } : answer
                ),
              }
            : question
        ),
      }
    }),
}
