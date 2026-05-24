import type { UserProfile } from '../context/auth-context'

export type QuestionType =
  | 'single'
  | 'multiple'
  | 'true_false'
  | 'short_answer'
  | 'fill_blank'
  | 'descriptive'
  | 'file_upload'
  | 'matching'
  | 'dropdown'

export interface QuizOption {
  id: string
  text: string
}

export interface MatchPair {
  id: string
  left: string
  right: string
}

export interface QuizQuestion {
  id: string
  type: QuestionType
  prompt: string
  points: number
  options: QuizOption[]
  correctOptionIds: string[]
  acceptedAnswers: string[]
  matchPairs: MatchPair[]
  required: boolean
}

export interface QuizSettings {
  durationMinutes: number
  passingPercentage: number
  attemptLimit: number
  allowRetry: boolean
  reviewAnswers: boolean
  instantResults: boolean
  randomizeQuestions: boolean
  randomizeOptions: boolean
  negativeMarking: number
  availableFrom: string
  availableUntil: string
  lockAfterDeadline: boolean
  autoSubmitOnTimerEnd: boolean
}

export interface LessonQuiz {
  id: string
  courseId: string
  lessonId: string
  title: string
  description: string
  published: boolean
  settings: QuizSettings
  questions: QuizQuestion[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export type AnswerValue = string | string[] | Record<string, string> | null

export interface QuizAttempt {
  id: string
  quizId: string
  courseId: string
  lessonId: string
  studentId: string
  studentName: string
  answers: Record<string, AnswerValue>
  markedForReview: string[]
  startedAt: string
  submittedAt: string | null
  durationSeconds: number
  score: number
  totalPoints: number
  percentage: number
  passed: boolean
  status: 'in_progress' | 'submitted' | 'needs_review'
}

export interface LessonAssignment {
  id: string
  courseId: string
  lessonId: string
  title: string
  description: string
  points: number
  dueAt: string
  published: boolean
  allowedTypes: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface SubmissionFile {
  id: string
  name: string
  type: string
  size: number
  base64: string
}

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  courseId: string
  lessonId: string
  studentId: string
  studentName: string
  note: string
  files: SubmissionFile[]
  submittedAt: string
  status: 'submitted' | 'approved' | 'rejected'
  marks: number | null
  feedback: string
  reviewedAt: string | null
  reviewedBy: string | null
}

export interface LessonAssessmentState {
  quizzes: LessonQuiz[]
  attempts: QuizAttempt[]
  assignments: LessonAssignment[]
  submissions: AssignmentSubmission[]
}

export interface QuizDraft {
  title: string
  description: string
  settings: QuizSettings
  questions: QuizQuestion[]
}

export interface AssignmentDraft {
  title: string
  description: string
  points: number
  dueAt: string
  published: boolean
}

const STORAGE_KEY = 'mentoro_lesson_assessments'
const CHANNEL_NAME = 'mentoro_lesson_assessments_changed'
const MAX_UPLOAD_SIZE = 12 * 1024 * 1024
const ALLOWED_UPLOADS = [
  'application/pdf',
  'application/zip',
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

type AssessmentStore = Record<string, LessonAssessmentState>

const emptyState = (): LessonAssessmentState => ({ quizzes: [], attempts: [], assignments: [], submissions: [] })
const keyFor = (courseId: string, lessonId: string) => `${courseId}:${lessonId}`
const uid = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
const now = () => new Date().toISOString()
const canManage = (user: UserProfile) => user.role === 'teacher'

const defaultSettings = (): QuizSettings => ({
  durationMinutes: 20,
  passingPercentage: 70,
  attemptLimit: 2,
  allowRetry: true,
  reviewAnswers: true,
  instantResults: true,
  randomizeQuestions: false,
  randomizeOptions: false,
  negativeMarking: 0,
  availableFrom: '',
  availableUntil: '',
  lockAfterDeadline: true,
  autoSubmitOnTimerEnd: true,
})

export const createBlankQuestion = (type: QuestionType = 'single'): QuizQuestion => {
  const baseOptions = [
    { id: uid('option'), text: 'Option A' },
    { id: uid('option'), text: 'Option B' },
  ]

  return {
    id: uid('question'),
    type,
    prompt: 'New question',
    points: 1,
    options: type === 'true_false' ? [{ id: 'true', text: 'True' }, { id: 'false', text: 'False' }] : baseOptions,
    correctOptionIds: type === 'true_false' ? ['true'] : [baseOptions[0].id],
    acceptedAnswers: [''],
    matchPairs: [
      { id: uid('pair'), left: 'Term', right: 'Match' },
      { id: uid('pair'), left: 'Concept', right: 'Definition' },
    ],
    required: true,
  }
}

export const createBlankQuizDraft = (): QuizDraft => ({
  title: 'Lesson quiz',
  description: '',
  settings: defaultSettings(),
  questions: [createBlankQuestion('single')],
})

const safeParse = (): AssessmentStore => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const writeStore = (store: AssessmentStore) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  window.dispatchEvent(new CustomEvent(CHANNEL_NAME))
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME)
    channel.postMessage({ type: 'changed' })
    channel.close()
  } catch {
    // Optional browser API; storage and custom events keep the feature live.
  }
}

const withStore = (
  courseId: string,
  lessonId: string,
  updater: (state: LessonAssessmentState) => LessonAssessmentState
) => {
  const store = safeParse()
  const key = keyFor(courseId, lessonId)
  const next = updater(store[key] ?? emptyState())
  store[key] = next
  writeStore(store)
  return next
}

const normalize = (value: string) => value.trim().toLowerCase()

const validateQuizDraft = (draft: QuizDraft) => {
  if (draft.title.trim().length < 3) throw new Error('Quiz title must be at least 3 characters.')
  if (draft.settings.durationMinutes < 1) throw new Error('Quiz duration must be at least 1 minute.')
  if (draft.settings.passingPercentage < 0 || draft.settings.passingPercentage > 100) {
    throw new Error('Passing percentage must be between 0 and 100.')
  }
  if (draft.settings.attemptLimit < 1) throw new Error('Attempt limit must be at least 1.')
  if (draft.questions.length === 0) throw new Error('Add at least one question.')
  draft.questions.forEach((question) => {
    if (question.prompt.trim().length < 2) throw new Error('Every question needs a prompt.')
    if (question.points <= 0) throw new Error('Question points must be greater than 0.')
  })
}

const validateAssignmentDraft = (draft: AssignmentDraft) => {
  if (draft.title.trim().length < 3) throw new Error('Assignment title must be at least 3 characters.')
  if (draft.points <= 0) throw new Error('Assignment points must be greater than 0.')
}

const scoreQuestion = (question: QuizQuestion, answer: AnswerValue) => {
  if (question.type === 'descriptive' || question.type === 'file_upload') return { score: 0, manual: true }
  if (answer === null || answer === undefined || answer === '') return { score: 0, manual: false }

  if (question.type === 'single' || question.type === 'true_false' || question.type === 'dropdown') {
    return { score: question.correctOptionIds.includes(String(answer)) ? question.points : 0, manual: false }
  }

  if (question.type === 'multiple') {
    const given = Array.isArray(answer) ? [...answer].sort() : []
    const correct = [...question.correctOptionIds].sort()
    const same = given.length === correct.length && given.every((id, index) => id === correct[index])
    return { score: same ? question.points : 0, manual: false }
  }

  if (question.type === 'matching') {
    const given = typeof answer === 'object' && !Array.isArray(answer) ? answer : {}
    const correct = question.matchPairs.every((pair) => given[pair.left] === pair.right)
    return { score: correct ? question.points : 0, manual: false }
  }

  const accepted = question.acceptedAnswers.map(normalize).filter(Boolean)
  const textAnswer = normalize(String(answer))
  return { score: accepted.includes(textAnswer) ? question.points : 0, manual: false }
}

const gradeAttempt = (quiz: LessonQuiz, attempt: QuizAttempt): QuizAttempt => {
  let score = 0
  let needsReview = false
  const totalPoints = quiz.questions.reduce((sum, question) => sum + question.points, 0)

  quiz.questions.forEach((question) => {
    const result = scoreQuestion(question, attempt.answers[question.id])
    score += result.score
    needsReview = needsReview || result.manual
    if (!result.manual && result.score === 0 && quiz.settings.negativeMarking > 0 && attempt.answers[question.id]) {
      score -= quiz.settings.negativeMarking
    }
  })

  const safeScore = Math.max(0, score)
  const percentage = totalPoints > 0 ? Math.round((safeScore / totalPoints) * 100) : 0
  return {
    ...attempt,
    score: safeScore,
    totalPoints,
    percentage,
    passed: percentage >= quiz.settings.passingPercentage,
    status: needsReview || !quiz.settings.instantResults ? 'needs_review' : 'submitted',
  }
}

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

export const lessonAssessmentService = {
  createBlankQuizDraft,
  createBlankQuestion,

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

  fetchLesson: async (courseId: string, lessonId: string): Promise<LessonAssessmentState> => {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return safeParse()[keyFor(courseId, lessonId)] ?? emptyState()
  },

  saveQuiz: (courseId: string, lessonId: string, user: UserProfile, draft: QuizDraft, quizId?: string) =>
    withStore(courseId, lessonId, (state) => {
      if (!canManage(user)) throw new Error('Only teachers can manage quizzes.')
      validateQuizDraft(draft)
      const timestamp = now()
      const existing = quizId ? state.quizzes.find((quiz) => quiz.id === quizId) : null
      const quiz: LessonQuiz = {
        id: existing?.id ?? uid('quiz'),
        courseId,
        lessonId,
        title: draft.title.trim(),
        description: draft.description.trim(),
        published: existing?.published ?? false,
        settings: draft.settings,
        questions: draft.questions,
        createdBy: existing?.createdBy ?? user.id,
        createdAt: existing?.createdAt ?? timestamp,
        updatedAt: timestamp,
      }
      return {
        ...state,
        quizzes: existing ? state.quizzes.map((item) => (item.id === quiz.id ? quiz : item)) : [quiz, ...state.quizzes],
      }
    }),

  deleteQuiz: (courseId: string, lessonId: string, user: UserProfile, quizId: string) =>
    withStore(courseId, lessonId, (state) => {
      if (!canManage(user)) throw new Error('Only teachers can delete quizzes.')
      return {
        ...state,
        quizzes: state.quizzes.filter((quiz) => quiz.id !== quizId),
        attempts: state.attempts.filter((attempt) => attempt.quizId !== quizId),
      }
    }),

  duplicateQuiz: (courseId: string, lessonId: string, user: UserProfile, quizId: string) =>
    withStore(courseId, lessonId, (state) => {
      if (!canManage(user)) throw new Error('Only teachers can duplicate quizzes.')
      const source = state.quizzes.find((quiz) => quiz.id === quizId)
      if (!source) throw new Error('Quiz not found.')
      return {
        ...state,
        quizzes: [
          {
            ...source,
            id: uid('quiz'),
            title: `${source.title} copy`,
            published: false,
            createdAt: now(),
            updatedAt: now(),
          },
          ...state.quizzes,
        ],
      }
    }),

  toggleQuizPublish: (courseId: string, lessonId: string, user: UserProfile, quizId: string) =>
    withStore(courseId, lessonId, (state) => {
      if (!canManage(user)) throw new Error('Only teachers can publish quizzes.')
      return {
        ...state,
        quizzes: state.quizzes.map((quiz) => (quiz.id === quizId ? { ...quiz, published: !quiz.published, updatedAt: now() } : quiz)),
      }
    }),

  startAttempt: (courseId: string, lessonId: string, user: UserProfile, quizId: string) =>
    withStore(courseId, lessonId, (state) => {
      if (user.role !== 'student') throw new Error('Only students can attempt quizzes.')
      const quiz = state.quizzes.find((item) => item.id === quizId && item.published)
      if (!quiz) throw new Error('Quiz is not available.')
      const deadline = quiz.settings.availableUntil ? new Date(quiz.settings.availableUntil) : null
      if (deadline && quiz.settings.lockAfterDeadline && Date.now() > deadline.getTime()) throw new Error('Quiz deadline has passed.')
      const attempts = state.attempts.filter((attempt) => attempt.quizId === quizId && attempt.studentId === user.id)
      const submittedCount = attempts.filter((attempt) => attempt.submittedAt).length
      if (submittedCount >= quiz.settings.attemptLimit) throw new Error('Attempt limit reached.')
      const active = attempts.find((attempt) => attempt.status === 'in_progress')
      if (active) return state
      return {
        ...state,
        attempts: [
          ...state.attempts,
          {
            id: uid('attempt'),
            quizId,
            courseId,
            lessonId,
            studentId: user.id,
            studentName: user.name,
            answers: {},
            markedForReview: [],
            startedAt: now(),
            submittedAt: null,
            durationSeconds: 0,
            score: 0,
            totalPoints: quiz.questions.reduce((sum, question) => sum + question.points, 0),
            percentage: 0,
            passed: false,
            status: 'in_progress',
          },
        ],
      }
    }),

  saveAttemptAnswer: (
    courseId: string,
    lessonId: string,
    user: UserProfile,
    attemptId: string,
    questionId: string,
    answer: AnswerValue,
    durationSeconds: number
  ) =>
    withStore(courseId, lessonId, (state) => ({
      ...state,
      attempts: state.attempts.map((attempt) => {
        if (attempt.id !== attemptId) return attempt
        if (attempt.studentId !== user.id) throw new Error('You can only edit your own attempt.')
        return {
          ...attempt,
          answers: { ...attempt.answers, [questionId]: answer },
          durationSeconds,
        }
      }),
    })),

  toggleMarkForReview: (courseId: string, lessonId: string, user: UserProfile, attemptId: string, questionId: string) =>
    withStore(courseId, lessonId, (state) => ({
      ...state,
      attempts: state.attempts.map((attempt) => {
        if (attempt.id !== attemptId) return attempt
        if (attempt.studentId !== user.id) throw new Error('You can only edit your own attempt.')
        const marked = attempt.markedForReview.includes(questionId)
        return {
          ...attempt,
          markedForReview: marked
            ? attempt.markedForReview.filter((id) => id !== questionId)
            : [...attempt.markedForReview, questionId],
        }
      }),
    })),

  submitAttempt: (courseId: string, lessonId: string, user: UserProfile, attemptId: string, durationSeconds: number) =>
    withStore(courseId, lessonId, (state) => {
      const attempt = state.attempts.find((item) => item.id === attemptId)
      if (!attempt) throw new Error('Attempt not found.')
      if (attempt.studentId !== user.id) throw new Error('You can only submit your own attempt.')
      const quiz = state.quizzes.find((item) => item.id === attempt.quizId)
      if (!quiz) throw new Error('Quiz not found.')
      const graded = gradeAttempt(quiz, { ...attempt, submittedAt: now(), durationSeconds })
      return { ...state, attempts: state.attempts.map((item) => (item.id === attemptId ? graded : item)) }
    }),

  saveAssignment: (courseId: string, lessonId: string, user: UserProfile, draft: AssignmentDraft, assignmentId?: string) =>
    withStore(courseId, lessonId, (state) => {
      if (!canManage(user)) throw new Error('Only teachers can manage assignments.')
      validateAssignmentDraft(draft)
      const timestamp = now()
      const existing = assignmentId ? state.assignments.find((assignment) => assignment.id === assignmentId) : null
      const assignment: LessonAssignment = {
        id: existing?.id ?? uid('assignment'),
        courseId,
        lessonId,
        title: draft.title.trim(),
        description: draft.description.trim(),
        points: draft.points,
        dueAt: draft.dueAt,
        published: draft.published,
        allowedTypes: ALLOWED_UPLOADS,
        createdBy: existing?.createdBy ?? user.id,
        createdAt: existing?.createdAt ?? timestamp,
        updatedAt: timestamp,
      }
      return {
        ...state,
        assignments: existing
          ? state.assignments.map((item) => (item.id === assignment.id ? assignment : item))
          : [assignment, ...state.assignments],
      }
    }),

  deleteAssignment: (courseId: string, lessonId: string, user: UserProfile, assignmentId: string) =>
    withStore(courseId, lessonId, (state) => {
      if (!canManage(user)) throw new Error('Only teachers can delete assignments.')
      return {
        ...state,
        assignments: state.assignments.filter((assignment) => assignment.id !== assignmentId),
        submissions: state.submissions.filter((submission) => submission.assignmentId !== assignmentId),
      }
    }),

  submitAssignment: async (
    courseId: string,
    lessonId: string,
    user: UserProfile,
    assignmentId: string,
    note: string,
    files: File[]
  ) => {
    if (user.role !== 'student') throw new Error('Only students can submit assignments.')
    if (files.length === 0) throw new Error('Attach at least one file.')
    const safeFiles = await Promise.all(
      files.map(async (file) => {
        if (file.size > MAX_UPLOAD_SIZE) throw new Error(`${file.name} is larger than 12 MB.`)
        if (!ALLOWED_UPLOADS.includes(file.type) && !file.name.toLowerCase().endsWith('.zip')) {
          throw new Error(`${file.name} is not an allowed file type.`)
        }
        return {
          id: uid('file'),
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          base64: await fileToBase64(file),
        }
      })
    )

    return withStore(courseId, lessonId, (state) => {
      const assignment = state.assignments.find((item) => item.id === assignmentId && item.published)
      if (!assignment) throw new Error('Assignment is not available.')
      if (assignment.dueAt && Date.now() > new Date(assignment.dueAt).getTime()) throw new Error('Assignment deadline has passed.')
      const previous = state.submissions.find((item) => item.assignmentId === assignmentId && item.studentId === user.id)
      const submission: AssignmentSubmission = {
        id: previous?.id ?? uid('submission'),
        assignmentId,
        courseId,
        lessonId,
        studentId: user.id,
        studentName: user.name,
        note: note.trim(),
        files: safeFiles,
        submittedAt: now(),
        status: 'submitted',
        marks: null,
        feedback: '',
        reviewedAt: null,
        reviewedBy: null,
      }
      return {
        ...state,
        submissions: previous
          ? state.submissions.map((item) => (item.id === previous.id ? submission : item))
          : [submission, ...state.submissions],
      }
    })
  },

  reviewSubmission: (
    courseId: string,
    lessonId: string,
    user: UserProfile,
    submissionId: string,
    status: AssignmentSubmission['status'],
    marks: number,
    feedback: string
  ) =>
    withStore(courseId, lessonId, (state) => {
      if (!canManage(user)) throw new Error('Only teachers can review submissions.')
      return {
        ...state,
        submissions: state.submissions.map((submission) =>
          submission.id === submissionId
            ? {
                ...submission,
                status,
                marks,
                feedback: feedback.trim(),
                reviewedAt: now(),
                reviewedBy: user.id,
              }
            : submission
        ),
      }
    }),
}
