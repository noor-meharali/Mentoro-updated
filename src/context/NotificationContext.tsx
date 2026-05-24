import React, { useCallback, useMemo, useState } from 'react'
import { NotificationContext, type NotificationItem } from './notification-context'

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'New course review submitted',
      description: 'A student left feedback for Design Systems.',
      time: '2h ago',
      unread: true,
    },
    {
      id: 'n2',
      title: 'Server maintenance scheduled',
      description: 'Maintenance window starts tomorrow at 2:00 AM.',
      time: '1d ago',
      unread: false,
    },
  ])

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, unread: notification.id === id ? false : notification.unread })))
  }, [])

  const addNotification = useCallback((notification: Pick<NotificationItem, 'title' | 'description'>) => {
    setNotifications((prev) => [
      {
        id: `n${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: notification.title,
        description: notification.description,
        time: 'Just now',
        unread: true,
      },
      ...prev,
    ])
  }, [])

  const value = useMemo(
    () => ({ notifications, markAsRead, addNotification }),
    [notifications, markAsRead, addNotification]
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
