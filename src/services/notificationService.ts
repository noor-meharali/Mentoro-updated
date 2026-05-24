import type { NotificationItem } from '../context/notification-context'

const notifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'New assignment posted',
    description: 'Course progress analytics now includes completion score.',
    time: '3m ago',
    unread: true,
  },
  {
    id: 'n2',
    title: 'Course snapshot ready',
    description: 'Your last curriculum update has been published.',
    time: '5h ago',
    unread: false,
  },
]

export const notificationService = {
  fetchNotifications: async (): Promise<NotificationItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return notifications
  },
}
