import { createContext } from 'react'

export interface NotificationItem {
  id: string
  title: string
  description: string
  time: string
  unread: boolean
}

export interface NotificationContextValue {
  notifications: NotificationItem[]
  markAsRead: (id: string) => void
  addNotification: (notification: Pick<NotificationItem, 'title' | 'description'>) => void
}

export const NotificationContext = createContext<NotificationContextValue | null>(null)
