import React, { useEffect, useMemo, useState } from 'react'
import { useLessonAssessment } from '../../hooks/useLessonAssessment'
import {
  createBlankQuestion,
  createBlankQuizDraft,
  type AnswerValue,
  type AssignmentDraft,
  type AssignmentSubmission,
  type LessonAssignment,
  type LessonQuiz,
  type QuestionType,
  type QuizAttempt,
  type QuizDraft,
  type QuizQuestion,
} from '../../services/lessonAssessmentService'

interface LessonAssessmentsProps {
  courseId: string
  lessonId: string
  lessonTitle: string
}

type Tab = 'quizzes' | 'assignments' | 'analytics'

const questionLabels: Record<QuestionType, string> = {
  single: 'Single answer',
  multiple: 'Multiple answers',
  true_false: 'True / False',
  short_answer: 'Short answer',
  fill_blank: 'Fill in the blank',
  descriptive: 'Descriptive',
  file_upload: 'File upload',
  matching: 'Matching',
  dropdown: 'Dropdown',
}

const formatDate = (value: string) => value ? new Date(value).toLocaleString() : 'No deadline'
const formatDuration = (seconds: number) => {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

const Badge: React.FC<{ tone?: 'cyan' | 'emerald' | 'rose' | 'amber' | 'slate'; children: React.ReactNode }> = ({ tone = 'slate', children }) => {
  const classes = {
    cyan: 'bg-cyan-500/15 text-cyan-300',
    emerald: 'bg-emerald-500/15 text-emerald-300',
    rose: 'bg-rose-500/15 text-rose-300',
    amber: 'bg-amber-500/15 text-amber-300',
    slate: 'bg-white/8 text-slate-300',
  }
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${classes[tone]}`}>{children}</span>
}

const Empty: React.FC<{ title: string; body: string }> = ({ title, body }) => (
  <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/35 px-5 py-8 text-center">
    <p className="text-sm font-semibold text-white">{title}</p>
    <p className="mt-1 text-sm text-slate-500">{body}</p>
  </div>
)

const Skeleton = () => (
  <div className="space-y-3">
    {[1, 2].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-white/5" />)}
  </div>
)

const QuizBuilder: React.FC<{
  initial?: LessonQuiz
  saving: boolean
  onCancel: () => void
  onSave: (draft: QuizDraft, quizId?: string) => void
}> = ({ initial, saving, onCancel, onSave }) => {
  const [draft, setDraft] = useState<QuizDraft>(() => initial
    ? {
        title: initial.title,
        description: initial.description,
        settings: initial.settings,
        questions: initial.questions,
      }
    : createBlankQuizDraft()
  )

  const updateQuestion = (questionId: string, updater: (question: QuizQuestion) => QuizQuestion) => {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((question) => question.id === questionId ? updater(question) : question),
    }))
  }

  const moveQuestion = (index: number, direction: -1 | 1) => {
    setDraft((prev) => {
      const next = [...prev.questions]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      const current = next[index]
      next[index] = next[target]
      next[target] = current
      return { ...prev, questions: next }
    })
  }

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium text-slate-300">Quiz title</span>
          <input
            value={draft.title}
            onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
            className="mt-1 min-h-10 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-300">Passing percentage</span>
          <input
            type="number"
            min={0}
            max={100}
            value={draft.settings.passingPercentage}
            onChange={(event) => setDraft((prev) => ({ ...prev, settings: { ...prev.settings, passingPercentage: Number(event.target.value) } }))}
            className="mt-1 min-h-10 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-300">Time limit minutes</span>
          <input
            type="number"
            min={1}
            value={draft.settings.durationMinutes}
            onChange={(event) => setDraft((prev) => ({ ...prev, settings: { ...prev.settings, durationMinutes: Number(event.target.value) } }))}
            className="mt-1 min-h-10 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-300">Attempt limit</span>
          <input
            type="number"
            min={1}
            value={draft.settings.attemptLimit}
            onChange={(event) => setDraft((prev) => ({ ...prev, settings: { ...prev.settings, attemptLimit: Number(event.target.value) } }))}
            className="mt-1 min-h-10 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
          />
        </label>
      </div>

      <label className="mt-3 block">
        <span className="text-xs font-medium text-slate-300">Description</span>
        <textarea
          value={draft.description}
          onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
          rows={2}
          className="mt-1 w-full resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
        />
      </label>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['instantResults', 'Instant results'],
          ['reviewAnswers', 'Review answers'],
          ['randomizeQuestions', 'Random questions'],
          ['randomizeOptions', 'Random options'],
          ['allowRetry', 'Allow retry'],
          ['lockAfterDeadline', 'Lock deadline'],
          ['autoSubmitOnTimerEnd', 'Auto-submit timer'],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 rounded-2xl bg-slate-950/45 px-3 py-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={Boolean(draft.settings[key as keyof typeof draft.settings])}
              onChange={(event) => setDraft((prev) => ({ ...prev, settings: { ...prev.settings, [key]: event.target.checked } }))}
              className="accent-cyan-400"
            />
            {label}
          </label>
        ))}
        <label className="rounded-2xl bg-slate-950/45 px-3 py-2 text-xs text-slate-300">
          Negative marks
          <input
            type="number"
            min={0}
            step={0.25}
            value={draft.settings.negativeMarking}
            onChange={(event) => setDraft((prev) => ({ ...prev, settings: { ...prev.settings, negativeMarking: Number(event.target.value) } }))}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-2 py-1 text-white outline-none"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium text-slate-300">Available from</span>
          <input
            type="datetime-local"
            value={draft.settings.availableFrom}
            onChange={(event) => setDraft((prev) => ({ ...prev, settings: { ...prev.settings, availableFrom: event.target.value } }))}
            className="mt-1 min-h-10 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-300">Available until</span>
          <input
            type="datetime-local"
            value={draft.settings.availableUntil}
            onChange={(event) => setDraft((prev) => ({ ...prev, settings: { ...prev.settings, availableUntil: event.target.value } }))}
            className="mt-1 min-h-10 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
          />
        </label>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-white">Questions</p>
          <select
            onChange={(event) => {
              if (!event.target.value) return
              setDraft((prev) => ({ ...prev, questions: [...prev.questions, createBlankQuestion(event.target.value as QuestionType)] }))
              event.target.value = ''
            }}
            className="min-h-9 rounded-full border border-white/10 bg-slate-950/80 px-3 text-xs text-white outline-none"
          >
            <option value="">Add question</option>
            {Object.entries(questionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>

        {draft.questions.map((question, index) => (
          <div key={question.id} className="rounded-2xl border border-white/8 bg-slate-950/45 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge tone="cyan">{index + 1}. {questionLabels[question.type]}</Badge>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => moveQuestion(index, -1)} className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">Up</button>
                <button onClick={() => moveQuestion(index, 1)} className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">Down</button>
                <button
                  onClick={() => setDraft((prev) => ({ ...prev, questions: prev.questions.filter((item) => item.id !== question.id) }))}
                  className="rounded-full bg-rose-500/10 px-3 py-1 text-xs text-rose-300"
                >
                  Remove
                </button>
              </div>
            </div>
            <textarea
              value={question.prompt}
              onChange={(event) => updateQuestion(question.id, (item) => ({ ...item, prompt: event.target.value }))}
              rows={2}
              className="mt-3 w-full resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
            />
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <label className="text-xs text-slate-400">
                Points
                <input
                  type="number"
                  min={1}
                  value={question.points}
                  onChange={(event) => updateQuestion(question.id, (item) => ({ ...item, points: Number(event.target.value) }))}
                  className="mt-1 min-h-9 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none"
                />
              </label>
              {(question.type === 'short_answer' || question.type === 'fill_blank') && (
                <label className="text-xs text-slate-400">
                  Accepted answers, comma separated
                  <input
                    value={question.acceptedAnswers.join(', ')}
                    onChange={(event) => updateQuestion(question.id, (item) => ({ ...item, acceptedAnswers: event.target.value.split(',').map((value) => value.trim()) }))}
                    className="mt-1 min-h-9 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none"
                  />
                </label>
              )}
            </div>
            {['single', 'multiple', 'true_false', 'dropdown'].includes(question.type) && (
              <div className="mt-3 space-y-2">
                {question.options.map((option) => (
                  <div key={option.id} className="flex gap-2">
                    <input
                      value={option.text}
                      disabled={question.type === 'true_false'}
                      onChange={(event) => updateQuestion(question.id, (item) => ({
                        ...item,
                        options: item.options.map((current) => current.id === option.id ? { ...current, text: event.target.value } : current),
                      }))}
                      className="min-h-9 flex-1 rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none"
                    />
                    <label className="flex min-h-9 items-center gap-2 rounded-xl bg-white/5 px-3 text-xs text-slate-300">
                      <input
                        type={question.type === 'multiple' ? 'checkbox' : 'radio'}
                        name={question.id}
                        checked={question.correctOptionIds.includes(option.id)}
                        onChange={(event) => updateQuestion(question.id, (item) => ({
                          ...item,
                          correctOptionIds: question.type === 'multiple'
                            ? event.target.checked
                              ? [...item.correctOptionIds, option.id]
                              : item.correctOptionIds.filter((id) => id !== option.id)
                            : [option.id],
                        }))}
                        className="accent-cyan-400"
                      />
                      Correct
                    </label>
                  </div>
                ))}
                {question.type !== 'true_false' && (
                  <button
                    onClick={() => updateQuestion(question.id, (item) => ({ ...item, options: [...item.options, { id: `option_${Date.now()}`, text: 'New option' }] }))}
                    className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-300"
                  >
                    Add option
                  </button>
                )}
              </div>
            )}
            {question.type === 'matching' && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {question.matchPairs.map((pair) => (
                  <React.Fragment key={pair.id}>
                    <input
                      value={pair.left}
                      onChange={(event) => updateQuestion(question.id, (item) => ({ ...item, matchPairs: item.matchPairs.map((current) => current.id === pair.id ? { ...current, left: event.target.value } : current) }))}
                      className="min-h-9 rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none"
                    />
                    <input
                      value={pair.right}
                      onChange={(event) => updateQuestion(question.id, (item) => ({ ...item, matchPairs: item.matchPairs.map((current) => current.id === pair.id ? { ...current, right: event.target.value } : current) }))}
                      className="min-h-9 rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none"
                    />
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => onSave(draft, initial?.id)}
          disabled={saving}
          className="min-h-10 rounded-full bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save quiz'}
        </button>
        <button onClick={onCancel} className="min-h-10 rounded-full border border-white/10 px-5 py-2 text-sm text-slate-300">
          Cancel
        </button>
      </div>
    </div>
  )
}

const QuestionInput: React.FC<{
  question: QuizQuestion
  value: AnswerValue
  onChange: (answer: AnswerValue) => void
}> = ({ question, value, onChange }) => {
  if (question.type === 'single' || question.type === 'true_false') {
    return (
      <div className="space-y-2">
        {question.options.map((option) => (
          <label key={option.id} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-slate-950/45 px-3 py-2 text-sm text-slate-200">
            <input type="radio" name={question.id} checked={value === option.id} onChange={() => onChange(option.id)} className="accent-cyan-400" />
            {option.text}
          </label>
        ))}
      </div>
    )
  }

  if (question.type === 'multiple') {
    const selected = Array.isArray(value) ? value : []
    return (
      <div className="space-y-2">
        {question.options.map((option) => (
          <label key={option.id} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-slate-950/45 px-3 py-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={selected.includes(option.id)}
              onChange={(event) => onChange(event.target.checked ? [...selected, option.id] : selected.filter((id) => id !== option.id))}
              className="accent-cyan-400"
            />
            {option.text}
          </label>
        ))}
      </div>
    )
  }

  if (question.type === 'dropdown') {
    return (
      <select value={typeof value === 'string' ? value : ''} onChange={(event) => onChange(event.target.value)} className="min-h-11 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none">
        <option value="">Select answer</option>
        {question.options.map((option) => <option key={option.id} value={option.id}>{option.text}</option>)}
      </select>
    )
  }

  if (question.type === 'matching') {
    const answer = typeof value === 'object' && value && !Array.isArray(value) ? value : {}
    return (
      <div className="space-y-2">
        {question.matchPairs.map((pair) => (
          <div key={pair.id} className="grid gap-2 sm:grid-cols-[1fr_1.2fr]">
            <div className="rounded-2xl bg-slate-950/50 px-3 py-2 text-sm text-slate-200">{pair.left}</div>
            <select
              value={answer[pair.left] ?? ''}
              onChange={(event) => onChange({ ...answer, [pair.left]: event.target.value })}
              className="min-h-10 rounded-2xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none"
            >
              <option value="">Choose match</option>
              {question.matchPairs.map((choice) => <option key={choice.id} value={choice.right}>{choice.right}</option>)}
            </select>
          </div>
        ))}
      </div>
    )
  }

  if (question.type === 'file_upload') {
    return (
      <input
        type="text"
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Add file link or submission note"
        className="min-h-11 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none"
      />
    )
  }

  return (
    <textarea
      value={typeof value === 'string' ? value : ''}
      onChange={(event) => onChange(event.target.value)}
      rows={question.type === 'descriptive' ? 5 : 2}
      placeholder="Type your answer"
      className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none"
    />
  )
}

const QuizAttemptView: React.FC<{
  quiz: LessonQuiz
  attempt: QuizAttempt
  saving: boolean
  onAnswer: (questionId: string, answer: AnswerValue, durationSeconds: number) => void
  onMark: (questionId: string) => void
  onSubmit: (durationSeconds: number) => void
}> = ({ quiz, attempt, saving, onAnswer, onMark, onSubmit }) => {
  const [index, setIndex] = useState(0)
  const [elapsed, setElapsed] = useState(attempt.durationSeconds)
  const questions = quiz.questions
  const current = questions[index]
  const answered = Object.values(attempt.answers).filter((answer) => answer !== null && answer !== '' && (!Array.isArray(answer) || answer.length > 0)).length
  const totalSeconds = quiz.settings.durationMinutes * 60
  const remaining = Math.max(0, totalSeconds - elapsed)

  useEffect(() => {
    const interval = window.setInterval(() => setElapsed((value) => value + 1), 1000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (remaining === 0 && quiz.settings.autoSubmitOnTimerEnd) onSubmit(elapsed)
  }, [elapsed, onSubmit, quiz.settings.autoSubmitOnTimerEnd, remaining])

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-base font-semibold text-white">{quiz.title}</h4>
          <p className="text-xs text-slate-400">Answered {answered} of {questions.length}</p>
        </div>
        <Badge tone={remaining < 60 ? 'rose' : 'cyan'}>Timer {formatDuration(remaining)}</Badge>
      </div>
      <div className="mt-3 h-2 rounded-full bg-white/8">
        <div className="h-2 rounded-full bg-cyan-400 transition-all" style={{ width: `${(answered / Math.max(questions.length, 1)) * 100}%` }} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_180px]">
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <Badge>{index + 1} / {questions.length}</Badge>
            <Badge tone="cyan">{current.points} pt</Badge>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm font-medium leading-6 text-white">{current.prompt}</p>
          <div className="mt-4">
            <QuestionInput question={current} value={attempt.answers[current.id] ?? null} onChange={(answer) => onAnswer(current.id, answer, elapsed)} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => setIndex((value) => Math.max(0, value - 1))} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">Previous</button>
            <button onClick={() => setIndex((value) => Math.min(questions.length - 1, value + 1))} className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">Save & next</button>
            <button onClick={() => onMark(current.id)} className="rounded-full bg-white/5 px-4 py-2 text-sm text-slate-300">Mark for review</button>
            <button disabled={saving} onClick={() => onSubmit(elapsed)} className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50">Submit</button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Navigator</p>
          <div className="mt-3 grid grid-cols-5 gap-2 lg:grid-cols-4">
            {questions.map((question, questionIndex) => {
              const hasAnswer = Boolean(attempt.answers[question.id])
              const marked = attempt.markedForReview.includes(question.id)
              return (
                <button
                  key={question.id}
                  onClick={() => setIndex(questionIndex)}
                  className={`h-9 rounded-xl text-xs font-semibold ${questionIndex === index ? 'bg-cyan-500 text-slate-950' : marked ? 'bg-amber-500/20 text-amber-200' : hasAnswer ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/5 text-slate-400'}`}
                >
                  {questionIndex + 1}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

const ResultCard: React.FC<{ quiz: LessonQuiz; attempt: QuizAttempt }> = ({ quiz, attempt }) => (
  <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-white">{quiz.title}</p>
        <p className="text-xs text-slate-500">Submitted {attempt.submittedAt ? formatDate(attempt.submittedAt) : 'Not submitted'} · Time {formatDuration(attempt.durationSeconds)}</p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-white">{attempt.percentage}%</p>
        <Badge tone={attempt.status === 'needs_review' ? 'amber' : attempt.passed ? 'emerald' : 'rose'}>
          {attempt.status === 'needs_review' ? 'Needs review' : attempt.passed ? 'Passed' : 'Failed'}
        </Badge>
      </div>
    </div>
    <div className="mt-3 h-2 rounded-full bg-white/8">
      <div className={`h-2 rounded-full ${attempt.passed ? 'bg-emerald-400' : 'bg-rose-400'}`} style={{ width: `${attempt.percentage}%` }} />
    </div>
    <p className="mt-2 text-xs text-slate-400">Score {attempt.score} / {attempt.totalPoints}</p>
  </div>
)

const AssignmentForm: React.FC<{
  initial?: LessonAssignment
  saving: boolean
  onCancel: () => void
  onSave: (draft: AssignmentDraft, assignmentId?: string) => void
}> = ({ initial, saving, onCancel, onSave }) => {
  const [draft, setDraft] = useState<AssignmentDraft>({
    title: initial?.title ?? 'Lesson assignment',
    description: initial?.description ?? '',
    points: initial?.points ?? 100,
    dueAt: initial?.dueAt ?? '',
    published: initial?.published ?? false,
  })

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input value={draft.title} onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))} className="min-h-10 rounded-2xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none" />
        <input type="number" min={1} value={draft.points} onChange={(event) => setDraft((prev) => ({ ...prev, points: Number(event.target.value) }))} className="min-h-10 rounded-2xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none" />
      </div>
      <textarea value={draft.description} onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))} rows={3} className="mt-3 w-full resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none" />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input type="datetime-local" value={draft.dueAt} onChange={(event) => setDraft((prev) => ({ ...prev, dueAt: event.target.value }))} className="min-h-10 rounded-2xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none" />
        <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={draft.published} onChange={(event) => setDraft((prev) => ({ ...prev, published: event.target.checked }))} className="accent-cyan-400" /> Published</label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button disabled={saving} onClick={() => onSave(draft, initial?.id)} className="rounded-full bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50">Save assignment</button>
        <button onClick={onCancel} className="rounded-full border border-white/10 px-5 py-2 text-sm text-slate-300">Cancel</button>
      </div>
    </div>
  )
}

const SubmissionBox: React.FC<{
  assignment: LessonAssignment
  saving: boolean
  existing?: AssignmentSubmission
  onSubmit: (note: string, files: File[]) => void
}> = ({ assignment, saving, existing, onSubmit }) => {
  const [note, setNote] = useState('')
  const [files, setFiles] = useState<File[]>([])

  return (
    <div className="mt-3 rounded-2xl border border-white/8 bg-slate-950/45 p-3">
      {existing && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge tone={existing.status === 'approved' ? 'emerald' : existing.status === 'rejected' ? 'rose' : 'amber'}>{existing.status}</Badge>
          {existing.marks !== null && <Badge tone="cyan">{existing.marks} / {assignment.points}</Badge>}
          {existing.feedback && <p className="text-xs text-slate-400">Feedback: {existing.feedback}</p>}
        </div>
      )}
      <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} placeholder="Submission note" className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none" />
      <input
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.mp4,.webm,.zip"
        onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
        className="mt-3 block w-full text-sm text-slate-300 file:mr-3 file:rounded-full file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950"
      />
      <button disabled={saving || files.length === 0} onClick={() => onSubmit(note, files)} className="mt-3 rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50">
        {existing ? 'Resubmit' : 'Submit assignment'}
      </button>
    </div>
  )
}

export const LessonAssessments: React.FC<LessonAssessmentsProps> = ({ courseId, lessonId, lessonTitle }) => {
  const assessment = useLessonAssessment(courseId, lessonId, lessonTitle)
  const [tab, setTab] = useState<Tab>('quizzes')
  const [editingQuiz, setEditingQuiz] = useState<LessonQuiz | null>(null)
  const [creatingQuiz, setCreatingQuiz] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<LessonAssignment | null>(null)
  const [creatingAssignment, setCreatingAssignment] = useState(false)
  const isTeacher = assessment.currentUser?.role === 'teacher'

  const visibleQuizzes = isTeacher ? assessment.quizzes : assessment.quizzes.filter((quiz) => quiz.published)
  const visibleAssignments = isTeacher ? assessment.assignments : assessment.assignments.filter((assignment) => assignment.published)
  const studentAttempts = assessment.attempts.filter((attempt) => attempt.studentId === assessment.currentUser?.id)
  const analytics = useMemo(() => {
    const submitted = assessment.attempts.filter((attempt) => attempt.submittedAt)
    const average = submitted.length ? Math.round(submitted.reduce((sum, attempt) => sum + attempt.percentage, 0) / submitted.length) : 0
    return { submitted: submitted.length, average, submissions: assessment.submissions.length }
  }, [assessment.attempts, assessment.submissions.length])

  return (
    <section className="mt-3 rounded-2xl border border-white/8 bg-slate-950/60 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">Quizzes & assessments</p>
          <h3 className="mt-1 truncate text-base font-semibold text-white">{lessonTitle}</h3>
        </div>
        <div className="flex rounded-full border border-white/10 bg-slate-900/80 p-1">
          {(['quizzes', 'assignments', ...(isTeacher ? ['analytics' as const] : [])] as Tab[]).map((item) => (
            <button key={item} onClick={() => setTab(item)} className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${tab === item ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
              {item}
            </button>
          ))}
        </div>
      </div>

      {assessment.error && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          <span>{assessment.error}</span>
          <button onClick={assessment.clearError} className="text-xs font-semibold text-rose-100">Dismiss</button>
        </div>
      )}

      <div className="mt-4 space-y-4">
        {assessment.loading && <Skeleton />}

        {!assessment.loading && tab === 'quizzes' && (
          <>
            {isTeacher && !creatingQuiz && !editingQuiz && (
              <button onClick={() => setCreatingQuiz(true)} className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">Create quiz</button>
            )}
            {(creatingQuiz || editingQuiz) && (
              <QuizBuilder
                initial={editingQuiz ?? undefined}
                saving={assessment.saving}
                onCancel={() => { setCreatingQuiz(false); setEditingQuiz(null) }}
                onSave={(draft, quizId) => {
                  assessment.saveQuiz(draft, quizId)
                  setCreatingQuiz(false)
                  setEditingQuiz(null)
                }}
              />
            )}
            {visibleQuizzes.length === 0 && <Empty title="No quizzes yet" body={isTeacher ? 'Create a quiz for this lesson.' : 'No published quiz is available for this lesson.'} />}
            {visibleQuizzes.map((quiz) => {
              const activeAttempt = studentAttempts.find((attempt) => attempt.quizId === quiz.id && attempt.status === 'in_progress')
              const submittedAttempts = studentAttempts.filter((attempt) => attempt.quizId === quiz.id && attempt.submittedAt)
              return (
                <div key={quiz.id} className="rounded-2xl border border-white/8 bg-slate-900/55 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-semibold text-white">{quiz.title}</h4>
                      <p className="mt-1 text-sm text-slate-400">{quiz.description || 'No description provided.'}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge tone={quiz.published ? 'emerald' : 'slate'}>{quiz.published ? 'Published' : 'Draft'}</Badge>
                        <Badge tone="cyan">{quiz.questions.length} questions</Badge>
                        <Badge>{quiz.settings.durationMinutes} min</Badge>
                        <Badge>{quiz.settings.passingPercentage}% pass</Badge>
                      </div>
                    </div>
                    {isTeacher ? (
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setEditingQuiz(quiz)} className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-300">Edit</button>
                        <button onClick={() => assessment.duplicateQuiz(quiz.id)} className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-300">Duplicate</button>
                        <button onClick={() => assessment.toggleQuizPublish(quiz.id)} className="rounded-full bg-cyan-500/15 px-3 py-1.5 text-xs text-cyan-300">{quiz.published ? 'Unpublish' : 'Publish'}</button>
                        <button onClick={() => { if (window.confirm('Delete this quiz?')) assessment.deleteQuiz(quiz.id) }} className="rounded-full bg-rose-500/10 px-3 py-1.5 text-xs text-rose-300">Delete</button>
                      </div>
                    ) : (
                      <button onClick={() => assessment.startAttempt(quiz.id)} className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">Start quiz</button>
                    )}
                  </div>
                  {activeAttempt && (
                    <div className="mt-4">
                      <QuizAttemptView
                        quiz={quiz}
                        attempt={activeAttempt}
                        saving={assessment.saving}
                        onAnswer={(questionId, answer, seconds) => assessment.saveAttemptAnswer(activeAttempt.id, questionId, answer, seconds)}
                        onMark={(questionId) => assessment.toggleMarkForReview(activeAttempt.id, questionId)}
                        onSubmit={(seconds) => assessment.submitAttempt(activeAttempt.id, seconds)}
                      />
                    </div>
                  )}
                  {submittedAttempts.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {submittedAttempts.map((attempt) => <ResultCard key={attempt.id} quiz={quiz} attempt={attempt} />)}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}

        {!assessment.loading && tab === 'assignments' && (
          <>
            {isTeacher && !creatingAssignment && !editingAssignment && (
              <button onClick={() => setCreatingAssignment(true)} className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">Create assignment</button>
            )}
            {(creatingAssignment || editingAssignment) && (
              <AssignmentForm
                initial={editingAssignment ?? undefined}
                saving={assessment.saving}
                onCancel={() => { setCreatingAssignment(false); setEditingAssignment(null) }}
                onSave={(draft, assignmentId) => {
                  assessment.saveAssignment(draft, assignmentId)
                  setCreatingAssignment(false)
                  setEditingAssignment(null)
                }}
              />
            )}
            {visibleAssignments.length === 0 && <Empty title="No assignments yet" body={isTeacher ? 'Create a lesson assignment.' : 'No assignment is available for this lesson.'} />}
            {visibleAssignments.map((assignment) => {
              const mine = assessment.submissions.find((submission) => submission.assignmentId === assignment.id && submission.studentId === assessment.currentUser?.id)
              const submissions = assessment.submissions.filter((submission) => submission.assignmentId === assignment.id)
              return (
                <div key={assignment.id} className="rounded-2xl border border-white/8 bg-slate-900/55 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-semibold text-white">{assignment.title}</h4>
                      <p className="mt-1 text-sm text-slate-400">{assignment.description || 'No description provided.'}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge tone={assignment.published ? 'emerald' : 'slate'}>{assignment.published ? 'Published' : 'Draft'}</Badge>
                        <Badge>{assignment.points} marks</Badge>
                        <Badge tone="amber">Due {formatDate(assignment.dueAt)}</Badge>
                      </div>
                    </div>
                    {isTeacher && (
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setEditingAssignment(assignment)} className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-300">Edit</button>
                        <button onClick={() => { if (window.confirm('Delete this assignment?')) assessment.deleteAssignment(assignment.id) }} className="rounded-full bg-rose-500/10 px-3 py-1.5 text-xs text-rose-300">Delete</button>
                      </div>
                    )}
                  </div>
                  {!isTeacher && (
                    <SubmissionBox assignment={assignment} existing={mine} saving={assessment.saving} onSubmit={(note, files) => assessment.submitAssignment(assignment.id, note, files)} />
                  )}
                  {isTeacher && submissions.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {submissions.map((submission) => (
                        <SubmissionReview key={submission.id} submission={submission} maxMarks={assignment.points} onReview={assessment.reviewSubmission} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}

        {!assessment.loading && tab === 'analytics' && isTeacher && (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-slate-900/55 p-4">
              <p className="text-xs text-slate-500">Quiz submissions</p>
              <p className="mt-2 text-2xl font-bold text-white">{analytics.submitted}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-slate-900/55 p-4">
              <p className="text-xs text-slate-500">Average score</p>
              <p className="mt-2 text-2xl font-bold text-white">{analytics.average}%</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-slate-900/55 p-4">
              <p className="text-xs text-slate-500">Assignment submissions</p>
              <p className="mt-2 text-2xl font-bold text-white">{analytics.submissions}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

const SubmissionReview: React.FC<{
  submission: AssignmentSubmission
  maxMarks: number
  onReview: (submissionId: string, status: AssignmentSubmission['status'], marks: number, feedback: string) => void
}> = ({ submission, maxMarks, onReview }) => {
  const [marks, setMarks] = useState(submission.marks ?? 0)
  const [feedback, setFeedback] = useState(submission.feedback)
  const [status, setStatus] = useState<AssignmentSubmission['status']>(submission.status)

  return (
    <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-white">{submission.studentName}</p>
          <p className="text-xs text-slate-500">{submission.files.length} file(s) · {formatDate(submission.submittedAt)}</p>
        </div>
        <Badge tone={submission.status === 'approved' ? 'emerald' : submission.status === 'rejected' ? 'rose' : 'amber'}>{submission.status}</Badge>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-[120px_150px_1fr_auto]">
        <input type="number" min={0} max={maxMarks} value={marks} onChange={(event) => setMarks(Number(event.target.value))} className="min-h-10 rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none" />
        <select value={status} onChange={(event) => setStatus(event.target.value as AssignmentSubmission['status'])} className="min-h-10 rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none">
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <input value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Feedback" className="min-h-10 rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none" />
        <button onClick={() => onReview(submission.id, status, marks, feedback)} className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">Review</button>
      </div>
    </div>
  )
}

export default LessonAssessments
