export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
  },
  courses: {
    list: '/courses',
    details: (id: string) => `/courses/${id}`,
  },
  notifications: '/notifications',
}
