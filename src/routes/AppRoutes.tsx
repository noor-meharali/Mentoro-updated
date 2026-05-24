import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Home from '../pages/shared/Home/Home'
import About from '../pages/shared/About/About'
import Contact from '../pages/shared/Contact/Contact'
import NotFound from '../pages/shared/NotFound/NotFound'
import Login from '../pages/auth/Login/Login'
import Register from '../pages/auth/Register/Register'
import TeacherDashboard from '../pages/teacher/Dashboard/TeacherDashboard'
import TeacherCourses from '../pages/teacher/Courses/TeacherCourses'
import TeacherStudents from '../pages/teacher/Students/TeacherStudents'
import TeacherAnalytics from '../pages/teacher/Analytics/TeacherAnalytics'
import TeacherNotifications from '../pages/teacher/Notifications/TeacherNotifications'
import TeacherSettings from '../pages/teacher/Settings/TeacherSettings'
import StudentDashboard from '../pages/student/Dashboard/StudentDashboard'
import StudentCourses from '../pages/student/MyCourses/StudentCourses'
import CourseDetails from '../pages/student/CourseDetails/CourseDetails'
import StudentProgress from '../pages/student/Progress/StudentProgress'
import StudentProfile from '../pages/student/Profile/StudentProfile'
import MainLayout from '../layouts/MainLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import AuthLayout from '../layouts/AuthLayout'
import ProtectedRoute from './ProtectedRoute'
import RoleBasedRoute from './RoleBasedRoute'

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Main Website Layout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      {/* Teacher Dashboard */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute>
            <RoleBasedRoute role="teacher">
              <DashboardLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="courses" element={<TeacherCourses />} />
        <Route path="courses/:courseId" element={<CourseDetails />} />
        <Route path="students" element={<TeacherStudents />} />
        <Route path="analytics" element={<TeacherAnalytics />} />
        <Route path="notifications" element={<TeacherNotifications />} />
        <Route path="settings" element={<TeacherSettings />} />
      </Route>

      {/* Student Dashboard */}
      <Route
        path="/student"
        element={
          <ProtectedRoute>
            <RoleBasedRoute role="student">
              <DashboardLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="courses" element={<StudentCourses />} />
        <Route path="courses/:courseId" element={<CourseDetails />} />
        <Route path="progress" element={<StudentProgress />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
