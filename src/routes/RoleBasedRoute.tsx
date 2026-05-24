import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface Props {
  children: React.ReactNode
  role: 'teacher' | 'student'
}

const RoleBasedRoute: React.FC<Props> = ({ children, role }) => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== role) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default RoleBasedRoute
