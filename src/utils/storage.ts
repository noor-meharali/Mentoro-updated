// ─── User session ────────────────────────────────────────────────────────────
const USER_KEY = 'mentoro_user'

interface StoredUser {
  id: string
  name: string
  email: string
  role: 'teacher' | 'student'
}

const isStoredUser = (v: unknown): v is StoredUser => {
  if (!v || typeof v !== 'object') return false
  const c = v as Partial<StoredUser>
  return (
    typeof c.id === 'string' &&
    typeof c.name === 'string' &&
    typeof c.email === 'string' &&
    (c.role === 'teacher' || c.role === 'student')
  )
}

// ─── Student profile extras ───────────────────────────────────────────────────
export interface StoredProfile {
  bio: string
  studyFocus: string
  avatarBase64: string | null   // base64 data-URL, persists across sessions
}

const PROFILE_KEY = 'mentoro_profile_'

// ─── Courses (teacher-created) ────────────────────────────────────────────────
const COURSES_KEY = 'mentoro_courses'

export const storage = {
  // ── Auth user ──
  getUser: () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(USER_KEY) ?? 'null')
      return isStoredUser(parsed) ? parsed : null
    } catch { return null }
  },
  setUser: (user: StoredUser) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(USER_KEY),

  // ── Student profile ──
  getProfile: (userId: string): StoredProfile => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY + userId)
      return raw ? JSON.parse(raw) : { bio: '', studyFocus: '', avatarBase64: null }
    } catch { return { bio: '', studyFocus: '', avatarBase64: null } }
  },
  setProfile: (userId: string, profile: StoredProfile) =>
    localStorage.setItem(PROFILE_KEY + userId, JSON.stringify(profile)),

  // ── Courses ──
  getCourses: (): import('../context/course-context').CourseSummary[] => {
    try {
      const raw = localStorage.getItem(COURSES_KEY)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  },
  setCourses: (courses: import('../context/course-context').CourseSummary[]) =>
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses)),
}
