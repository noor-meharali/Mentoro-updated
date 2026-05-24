import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CourseProvider } from './context/CourseContext'
import { NotificationProvider } from './context/NotificationContext'
import AppRoutes from './routes/AppRoutes'
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CourseProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </CourseProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
