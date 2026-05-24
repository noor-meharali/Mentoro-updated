import React, { useRef, useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { storage } from '../../../utils/storage'

const TeacherSettings: React.FC = () => {
  const { user } = useAuth()
  const profileData = user ? storage.getProfile(user.id) : { bio: '', studyFocus: '', avatarBase64: null }

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name ?? '')
  const [bio, setBio] = useState(profileData.bio)
  const [specialty, setSpecialty] = useState(profileData.studyFocus)
  const [avatarBase64, setAvatarBase64] = useState<string | null>(profileData.avatarBase64)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAvatarBase64(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!user) return
    storage.setProfile(user.id, {
      bio,
      studyFocus: specialty,
      avatarBase64,
    })
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/85 p-5 shadow-2xl shadow-slate-950/20 sm:rounded-3xl sm:p-8">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/70 sm:text-sm sm:tracking-[0.35em]">
            Account settings
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">Teacher profile</h2>
          <p className="mt-2 text-slate-400">Update your public profile, photo, and workspace preferences.</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="min-h-11 rounded-full bg-cyan-500 px-6 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Edit profile
          </button>
        )}
      </div>

      {saved && (
        <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          ✓ Profile saved successfully.
        </p>
      )}

      {/* Profile card */}
      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-xl shadow-slate-950/20 sm:rounded-3xl sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-cyan-400/30 bg-slate-800">
              {avatarBase64 ? (
                <img src={avatarBase64} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-cyan-300">
                  {(user?.name ?? 'T')[0].toUpperCase()}
                </div>
              )}
            </div>
            {editing && (
              <>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs text-slate-300 transition hover:bg-white/5"
                >
                  Change photo
                </button>
                {avatarBase64 && (
                  <button
                    type="button"
                    onClick={() => setAvatarBase64(null)}
                    className="text-xs text-rose-400 transition hover:text-rose-300"
                  >
                    Remove
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarChange}
                />
              </>
            )}
          </div>

          {/* Fields */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm text-slate-400">Name</label>
              {editing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                />
              ) : (
                <p className="mt-1 text-white">{user?.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400">Email</label>
              <p className="mt-1 text-white">{user?.email}</p>
            </div>

            <div>
              <label className="block text-sm text-slate-400">Specialty</label>
              {editing ? (
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="e.g. Full Stack Development"
                  className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                />
              ) : (
                <p className="mt-1 text-slate-300">{specialty || '—'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400">Bio</label>
              {editing ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Tell students about yourself…"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                />
              ) : (
                <p className="mt-1 text-slate-300">{bio || '—'}</p>
              )}
            </div>

            {editing && (
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="min-h-11 rounded-full bg-cyan-500 px-6 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  Save changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="min-h-11 rounded-full border border-white/10 px-6 py-2 text-sm text-slate-300 transition hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Extra settings */}
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-xl shadow-slate-950/15 sm:rounded-3xl sm:p-6">
          <h3 className="text-lg font-semibold text-white">Subscription</h3>
          <p className="mt-2 text-slate-400">Mentoro Pro — Premium access with enterprise course analytics and custom workflows.</p>
        </section>
        <section className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-xl shadow-slate-950/15 sm:rounded-3xl sm:p-6">
          <h3 className="text-lg font-semibold text-white">Notifications</h3>
          <p className="mt-2 text-slate-400">Email and in-app alerts for new enrollments and student activity.</p>
        </section>
      </div>
    </div>
  )
}

export default TeacherSettings
