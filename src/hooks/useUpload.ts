import { useState } from 'react'

export const useUpload = () => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const uploadFile = async (file: File) => {
    setUploading(true)
    setProgress(0)

    await new Promise<void>((resolve) => {
      const interval = window.setInterval(() => {
        setProgress((current) => {
          const next = current + 18
          if (next >= 100) {
            window.clearInterval(interval)
            resolve()
            return 100
          }
          return next
        })
      }, 200)
    })

    setUploading(false)
    return { success: true, fileName: file.name }
  }

  return { uploading, progress, uploadFile }
}
