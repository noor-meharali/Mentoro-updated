import React, { useMemo, useState } from 'react'
import { useLessonDiscussion } from '../../hooks/useLessonDiscussion'
import type { LessonAnswer, LessonComment, LessonQuestion, LessonReply } from '../../services/lessonDiscussionService'

interface LessonDiscussionProps {
  courseId: string
  lessonId: string
  lessonTitle: string
}

type Tab = 'comments' | 'qa'

const formatTime = (value: string) =>
  new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(
    new Date(value)
  )

const Avatar: React.FC<{ initials: string; role: string }> = ({ initials, role }) => (
  <div
    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
      role === 'teacher' ? 'bg-cyan-500 text-slate-950' : 'bg-white/10 text-slate-100'
    }`}
  >
    {initials}
  </div>
)

const Meta: React.FC<{
  name: string
  role: string
  createdAt: string
  updatedAt: string | null
}> = ({ name, role, createdAt, updatedAt }) => (
  <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
    <span className="truncate text-sm font-semibold text-white">{name}</span>
    {role === 'teacher' && (
      <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-300">
        Teacher
      </span>
    )}
    <span className="text-xs text-slate-500">{formatTime(createdAt)}</span>
    {updatedAt && <span className="text-xs text-slate-500">Edited</span>}
  </div>
)

const Composer: React.FC<{
  placeholder: string
  buttonLabel: string
  disabled?: boolean
  compact?: boolean
  onSubmit: (body: string) => void
}> = ({ placeholder, buttonLabel, disabled, compact, onSubmit }) => {
  const [body, setBody] = useState('')
  const [touched, setTouched] = useState(false)
  const invalid = touched && body.trim().length < 2

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    setTouched(true)
    if (disabled || body.trim().length < 2) return
    onSubmit(body)
    setBody('')
    setTouched(false)
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea
        value={body}
        onBlur={() => setTouched(true)}
        onChange={(event) => setBody(event.target.value.slice(0, 1200))}
        placeholder={placeholder}
        disabled={disabled}
        rows={compact ? 2 : 3}
        className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 disabled:opacity-60"
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={`text-xs ${invalid ? 'text-rose-300' : 'text-slate-500'}`}>
          {invalid ? 'Please enter at least 2 characters.' : `${body.length}/1200`}
        </p>
        <button
          type="submit"
          disabled={disabled || body.trim().length < 2}
          className="min-h-9 rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-40"
        >
          {buttonLabel}
        </button>
      </div>
    </form>
  )
}

const QuestionComposer: React.FC<{
  disabled?: boolean
  onSubmit: (title: string, body: string) => void
}> = ({ disabled, onSubmit }) => {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (disabled || title.trim().length < 4 || body.trim().length < 2) return
    onSubmit(title, body)
    setTitle('')
    setBody('')
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value.slice(0, 140))}
        placeholder="Question title"
        disabled={disabled}
        className="min-h-10 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 disabled:opacity-60"
      />
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value.slice(0, 1200))}
        placeholder="Add context so your teacher can answer clearly."
        disabled={disabled}
        rows={3}
        className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 disabled:opacity-60"
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">{title.length}/140 title, {body.length}/1200 details</p>
        <button
          type="submit"
          disabled={disabled || title.trim().length < 4 || body.trim().length < 2}
          className="min-h-9 rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-40"
        >
          Ask question
        </button>
      </div>
    </form>
  )
}

const InlineEdit: React.FC<{
  initialBody: string
  onCancel: () => void
  onSave: (body: string) => void
}> = ({ initialBody, onCancel, onSave }) => {
  const [body, setBody] = useState(initialBody)
  return (
    <div className="space-y-2">
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value.slice(0, 1200))}
        rows={3}
        className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
      />
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSave(body)}
          disabled={body.trim().length < 2}
          className="rounded-full bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 disabled:opacity-40"
        >
          Save
        </button>
        <button onClick={onCancel} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300">
          Cancel
        </button>
      </div>
    </div>
  )
}

const ReplyRow: React.FC<{ reply: LessonReply }> = ({ reply }) => (
  <div className="flex gap-3 rounded-2xl bg-slate-950/45 p-3">
    <Avatar initials={reply.author.avatarInitials} role={reply.author.role} />
    <div className="min-w-0 flex-1">
      <Meta name={reply.author.name} role={reply.author.role} createdAt={reply.createdAt} updatedAt={reply.updatedAt} />
      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-300">{reply.body}</p>
    </div>
  </div>
)

const CommentCard: React.FC<{
  comment: LessonComment
  userId: string | null
  canModerate: boolean
  onLike: () => void
  onReply: (body: string) => void
  onEdit: (body: string) => void
  onDelete: () => void
  onPin: () => void
}> = ({ comment, userId, canModerate, onLike, onReply, onEdit, onDelete, onPin }) => {
  const [replying, setReplying] = useState(false)
  const [editing, setEditing] = useState(false)
  const canManage = userId === comment.author.id || canModerate
  const liked = !!userId && comment.likes.includes(userId)

  return (
    <article className={`rounded-2xl border p-4 ${comment.pinned ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-white/8 bg-slate-900/55'}`}>
      <div className="flex gap-3">
        <Avatar initials={comment.author.avatarInitials} role={comment.author.role} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <Meta name={comment.author.name} role={comment.author.role} createdAt={comment.createdAt} updatedAt={comment.updatedAt} />
            {comment.pinned && <span className="rounded-full bg-cyan-500/15 px-2 py-1 text-xs text-cyan-300">Pinned</span>}
          </div>

          {editing ? (
            <div className="mt-3">
              <InlineEdit initialBody={comment.body} onCancel={() => setEditing(false)} onSave={(body) => { onEdit(body); setEditing(false) }} />
            </div>
          ) : (
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">{comment.body}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button onClick={onLike} className={`rounded-full px-3 py-1.5 text-xs transition ${liked ? 'bg-cyan-500/15 text-cyan-300' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
              Like {comment.likes.length}
            </button>
            <button onClick={() => setReplying((value) => !value)} className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/10">
              Reply
            </button>
            {canManage && (
              <>
                <button onClick={() => setEditing(true)} className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/10">
                  Edit
                </button>
                <button onClick={onDelete} className="rounded-full bg-rose-500/10 px-3 py-1.5 text-xs text-rose-300 transition hover:bg-rose-500/15">
                  Delete
                </button>
              </>
            )}
            {canModerate && (
              <button onClick={onPin} className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/10">
                {comment.pinned ? 'Unpin' : 'Pin'}
              </button>
            )}
          </div>

          {replying && (
            <div className="mt-3">
              <Composer compact placeholder="Write a reply..." buttonLabel="Reply" onSubmit={(body) => { onReply(body); setReplying(false) }} />
            </div>
          )}

          {comment.replies.length > 0 && (
            <div className="mt-3 space-y-2">
              {comment.replies.map((reply) => <ReplyRow key={reply.id} reply={reply} />)}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

const AnswerCard: React.FC<{
  answer: LessonAnswer
  userId: string | null
  canModerate: boolean
  onUpvote: () => void
  onAccept: () => void
  onHighlight: () => void
}> = ({ answer, userId, canModerate, onUpvote, onAccept, onHighlight }) => {
  const upvoted = !!userId && answer.upvotes.includes(userId)
  return (
    <div className={`rounded-2xl border p-3 ${answer.accepted ? 'border-emerald-500/30 bg-emerald-500/5' : answer.highlighted ? 'border-cyan-500/25 bg-cyan-500/5' : 'border-white/8 bg-slate-950/45'}`}>
      <div className="flex gap-3">
        <Avatar initials={answer.author.avatarInitials} role={answer.author.role} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Meta name={answer.author.name} role={answer.author.role} createdAt={answer.createdAt} updatedAt={answer.updatedAt} />
            <div className="flex flex-wrap gap-1">
              {answer.accepted && <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs text-emerald-300">Solved</span>}
              {answer.highlighted && <span className="rounded-full bg-cyan-500/15 px-2 py-1 text-xs text-cyan-300">Best answer</span>}
            </div>
          </div>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">{answer.body}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={onUpvote} className={`rounded-full px-3 py-1.5 text-xs transition ${upvoted ? 'bg-cyan-500/15 text-cyan-300' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
              Upvote {answer.upvotes.length}
            </button>
            {canModerate && (
              <>
                <button onClick={onAccept} className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/10">
                  {answer.accepted ? 'Unmark solved' : 'Mark solved'}
                </button>
                <button onClick={onHighlight} className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/10">
                  {answer.highlighted ? 'Unhighlight' : 'Highlight'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const QuestionCard: React.FC<{
  question: LessonQuestion
  userId: string | null
  canModerate: boolean
  onDelete: () => void
  onEdit: (title: string, body: string) => void
  onAnswer: (body: string) => void
  onUpvoteAnswer: (answerId: string) => void
  onAcceptAnswer: (answerId: string) => void
  onHighlightAnswer: (answerId: string) => void
}> = ({ question, userId, canModerate, onDelete, onEdit, onAnswer, onUpvoteAnswer, onAcceptAnswer, onHighlightAnswer }) => {
  const [answering, setAnswering] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(question.title)
  const [editBody, setEditBody] = useState(question.body)
  const canManage = userId === question.author.id || canModerate
  const solved = question.answers.some((answer) => answer.accepted)

  return (
    <article className="rounded-2xl border border-white/8 bg-slate-900/55 p-4">
      <div className="flex gap-3">
        <Avatar initials={question.author.avatarInitials} role={question.author.role} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <Meta name={question.author.name} role={question.author.role} createdAt={question.createdAt} updatedAt={question.updatedAt} />
            {solved && <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs text-emerald-300">Solved</span>}
          </div>
          {editing ? (
            <div className="mt-3 space-y-2">
              <input
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value.slice(0, 140))}
                className="min-h-10 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
              />
              <textarea
                value={editBody}
                onChange={(event) => setEditBody(event.target.value.slice(0, 1200))}
                rows={3}
                className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    onEdit(editTitle, editBody)
                    setEditing(false)
                  }}
                  disabled={editTitle.trim().length < 4 || editBody.trim().length < 2}
                  className="rounded-full bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 disabled:opacity-40"
                >
                  Save
                </button>
                <button onClick={() => setEditing(false)} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h4 className="mt-2 break-words text-base font-semibold text-white">{question.title}</h4>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">{question.body}</p>
            </>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => setAnswering((value) => !value)} className="rounded-full bg-cyan-500/15 px-3 py-1.5 text-xs text-cyan-300 transition hover:bg-cyan-500/20">
              Answer
            </button>
            {canManage && (
              <>
                <button onClick={() => setEditing(true)} className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/10">
                  Edit
                </button>
                <button onClick={onDelete} className="rounded-full bg-rose-500/10 px-3 py-1.5 text-xs text-rose-300 transition hover:bg-rose-500/15">
                  Delete
                </button>
              </>
            )}
          </div>
          {answering && (
            <div className="mt-3">
              <Composer compact placeholder="Write an answer..." buttonLabel="Post answer" onSubmit={(body) => { onAnswer(body); setAnswering(false) }} />
            </div>
          )}
          {question.answers.length > 0 && (
            <div className="mt-3 space-y-2">
              {question.answers.map((answer) => (
                <AnswerCard
                  key={answer.id}
                  answer={answer}
                  userId={userId}
                  canModerate={canModerate}
                  onUpvote={() => onUpvoteAnswer(answer.id)}
                  onAccept={() => onAcceptAnswer(answer.id)}
                  onHighlight={() => onHighlightAnswer(answer.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

const Skeleton = () => (
  <div className="space-y-3">
    {[1, 2].map((item) => (
      <div key={item} className="h-24 animate-pulse rounded-2xl bg-white/5" />
    ))}
  </div>
)

const Empty: React.FC<{ title: string; body: string }> = ({ title, body }) => (
  <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/35 px-5 py-8 text-center">
    <p className="text-sm font-semibold text-white">{title}</p>
    <p className="mt-1 text-sm text-slate-500">{body}</p>
  </div>
)

export const LessonDiscussion: React.FC<LessonDiscussionProps> = ({ courseId, lessonId, lessonTitle }) => {
  const [tab, setTab] = useState<Tab>('comments')
  const discussion = useLessonDiscussion(courseId, lessonId, lessonTitle)
  const canModerate = discussion.currentUser?.role === 'teacher'
  const userId = discussion.currentUser?.id ?? null

  const sortedComments = useMemo(
    () => [...discussion.comments].sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [discussion.comments]
  )

  return (
    <section className="mt-3 rounded-2xl border border-white/8 bg-slate-950/60 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">Lesson discussion</p>
          <h3 className="mt-1 truncate text-base font-semibold text-white">{lessonTitle}</h3>
        </div>
        <div className="flex rounded-full border border-white/10 bg-slate-900/80 p-1">
          <button onClick={() => setTab('comments')} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${tab === 'comments' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
            Comments {discussion.comments.length}
          </button>
          <button onClick={() => setTab('qa')} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${tab === 'qa' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
            Q&A {discussion.questions.length}
          </button>
        </div>
      </div>

      {discussion.error && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          <span>{discussion.error}</span>
          <button onClick={discussion.clearError} className="text-xs font-semibold text-rose-100">Dismiss</button>
        </div>
      )}

      <div className="mt-4 space-y-4">
        {tab === 'comments' && (
          <>
            <Composer
              placeholder="Share a note or ask for clarification..."
              buttonLabel="Post comment"
              disabled={!discussion.currentUser}
              onSubmit={discussion.addComment}
            />
            {discussion.loading ? <Skeleton /> : sortedComments.length > 0 ? (
              <div className="space-y-3">
                {sortedComments.map((comment) => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    userId={userId}
                    canModerate={canModerate}
                    onLike={() => discussion.toggleCommentLike(comment.id)}
                    onReply={(body) => discussion.addReply(comment.id, body)}
                    onEdit={(body) => discussion.editComment(comment.id, body)}
                    onDelete={() => {
                      if (window.confirm('Delete this comment?')) discussion.deleteComment(comment.id)
                    }}
                    onPin={() => discussion.togglePinComment(comment.id)}
                  />
                ))}
              </div>
            ) : (
              <Empty title="No comments yet" body="Start the lesson conversation with a useful note or question." />
            )}
          </>
        )}

        {tab === 'qa' && (
          <>
            <QuestionComposer disabled={!discussion.currentUser} onSubmit={discussion.addQuestion} />
            {discussion.loading ? <Skeleton /> : discussion.questions.length > 0 ? (
              <div className="space-y-3">
                {discussion.questions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    userId={userId}
                    canModerate={canModerate}
                    onDelete={() => {
                      if (window.confirm('Delete this question?')) discussion.deleteQuestion(question.id)
                    }}
                    onEdit={(title, body) => discussion.editQuestion(question.id, title, body)}
                    onAnswer={(body) => discussion.addAnswer(question.id, body)}
                    onUpvoteAnswer={(answerId) => discussion.toggleAnswerUpvote(question.id, answerId)}
                    onAcceptAnswer={(answerId) => discussion.toggleAcceptedAnswer(question.id, answerId)}
                    onHighlightAnswer={(answerId) => discussion.toggleHighlightedAnswer(question.id, answerId)}
                  />
                ))}
              </div>
            ) : (
              <Empty title="No questions yet" body="Ask a lesson-specific question and keep the thread easy to follow." />
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default LessonDiscussion
