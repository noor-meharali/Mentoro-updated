import { useEffect, useState } from 'react'
import { teacherStudentService, type TeacherStudentSnapshot } from '../services/teacherStudentService'

const emptySnapshot: TeacherStudentSnapshot = {
  rows: [],
  activeCount: 0,
  pendingCount: 0,
  completedCount: 0,
  averageProgress: 0,
}

export const useTeacherStudents = () => {
  const [snapshot, setSnapshot] = useState<TeacherStudentSnapshot>(emptySnapshot)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    teacherStudentService.fetchSnapshot()
      .then((next) => {
        if (active) setSnapshot(next)
      })
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to load students.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    const unsubscribe = teacherStudentService.subscribe(() => {
      teacherStudentService.fetchSnapshot().then(setSnapshot).catch(() => undefined)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return { ...snapshot, loading, error }
}
