import { createContext } from 'react'

export interface UserProfile {
  id: string
  name: string
  email: string
  role: 'teacher' | 'student'
}

export interface AuthContextValue {
  user: UserProfile | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<UserProfile>
  register: (name: string, email: string, password: string, role: 'teacher' | 'student') => Promise<UserProfile>
  logout: () => void
  clearError: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
