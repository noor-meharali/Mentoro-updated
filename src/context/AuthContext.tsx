import React, { useCallback, useMemo, useState } from 'react'
import { authService } from '../services/authService'
import { storage } from '../utils/storage'
import { AuthContext, type UserProfile } from './auth-context'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => storage.getUser())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const authenticated = await authService.login(email, password)
      setUser(authenticated)
      storage.setUser(authenticated)
      return authenticated
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Unable to sign in. Please try again.'
      setError(message)
      throw requestError
    } finally {
      setLoading(false)
    }
  }, [])

  // FIX: register now calls authService.register, saves the user, and logs them in automatically
  const register = useCallback(
    async (name: string, email: string, password: string, role: 'teacher' | 'student') => {
      setLoading(true)
      setError(null)

      try {
        const newUser = await authService.register(name, email, password, role)
        setUser(newUser)
        storage.setUser(newUser)
        return newUser
      } catch (requestError) {
        const message =
          requestError instanceof Error ? requestError.message : 'Unable to create account. Please try again.'
        setError(message)
        throw requestError
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const logout = useCallback(() => {
    setUser(null)
    storage.removeUser()
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const value = useMemo(
    () => ({ user, loading, error, login, register, logout, clearError }),
    [user, loading, error, login, register, logout, clearError]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
