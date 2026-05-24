export interface AuthPayload {
  id: string
  name: string
  email: string
  role: 'teacher' | 'student'
}

// Seed profiles — always available even if localStorage is empty
const seedProfiles: AuthPayload[] = [
  { id: 't1', name: 'Avery Hart', email: 'teacher@mentoro.app', role: 'teacher' },
  { id: 's1', name: 'Jordan Lee', email: 'student@mentoro.app', role: 'student' },
]

const REGISTERED_USERS_KEY = 'mentoro_registered_users'

// Load all users: seeds + anything registered at runtime
const loadProfiles = (): AuthPayload[] => {
  try {
    const stored = localStorage.getItem(REGISTERED_USERS_KEY)
    const extra: AuthPayload[] = stored ? JSON.parse(stored) : []
    return [...seedProfiles, ...extra]
  } catch {
    return [...seedProfiles]
  }
}

// Persist a newly registered user
const saveNewUser = (user: AuthPayload): void => {
  try {
    const stored = localStorage.getItem(REGISTERED_USERS_KEY)
    const extra: AuthPayload[] = stored ? JSON.parse(stored) : []
    extra.push(user)
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(extra))
    window.dispatchEvent(new CustomEvent('mentoro_registered_users_changed'))
  } catch {
    // Storage write failed — non-fatal
  }
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthPayload> => {
    await new Promise((resolve) => setTimeout(resolve, 400))

    if (!email.trim() || !password.trim()) {
      throw new Error('Email and password are required.')
    }

    const profiles = loadProfiles()
    const user = profiles.find(
      (profile) => profile.email.toLowerCase() === email.trim().toLowerCase()
    )

    if (!user) {
      throw new Error('No Mentoro account was found for that email.')
    }

    return user
  },

  register: async (
    name: string,
    email: string,
    password: string,
    role: 'teacher' | 'student'
  ): Promise<AuthPayload> => {
    await new Promise((resolve) => setTimeout(resolve, 400))

    if (!name.trim() || !email.trim() || !password.trim()) {
      throw new Error('All fields are required.')
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.')
    }

    const profiles = loadProfiles()
    const existing = profiles.find(
      (p) => p.email.toLowerCase() === email.trim().toLowerCase()
    )

    if (existing) {
      throw new Error('An account with this email already exists.')
    }

    const newUser: AuthPayload = {
      id: `${role[0]}${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
    }

    saveNewUser(newUser)
    return newUser
  },
}
