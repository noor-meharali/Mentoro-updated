import type { CourseSummary } from '../context/course-context'
import { storage } from '../utils/storage'
import { mediaDB } from './mediaDB'

// ─── Seed data ────────────────────────────────────────────────────────────────
const seedCourses: CourseSummary[] = [
  {
    id: 'c1', title: 'Enterprise UX Design', category: 'Design',
    students: 128, progress: 82, published: true,
    videos: [], images: [], documents: [],
  },
  {
    id: 'c2', title: 'React Architecture', category: 'Engineering',
    students: 94, progress: 68, published: true,
    videos: [], images: [], documents: [],
  },
  {
    id: 'c3', title: 'Data-Driven Teaching', category: 'Professional',
    students: 57, progress: 45, published: false,
    videos: [], images: [], documents: [],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const load = (): CourseSummary[] => {
  const stored = storage.getCourses()
  if (stored.length > 0) {
    // Ensure legacy courses without `images` array still work
    return stored.map((c) => ({ ...c, images: c.images ?? [] }))
  }
  return seedCourses
}

/** Save courses WITHOUT blob URLs — those are session-only and must be regenerated */
const saveWithoutBlobUrls = (courses: CourseSummary[]) => {
  const stripped = courses.map((c) => ({
    ...c,
    videos: c.videos.map((v) => ({ ...v, blobUrl: '' })),
    images: c.images.map((img) => ({ ...img, blobUrl: '' })),
  }))
  storage.setCourses(stripped)
}

const delay = () => new Promise((r) => setTimeout(r, 200))

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
export { formatSize }

// ─── Exported service ─────────────────────────────────────────────────────────
export const courseService = {
  /**
   * Load all courses, refreshing video/image blob URLs from IndexedDB.
   * This is the KEY FIX: blob URLs are recreated fresh each session from
   * IndexedDB-stored ArrayBuffers, so videos always play after page reload.
   */
  fetchAll: async (): Promise<CourseSummary[]> => {
    await delay()
    const courses = load()

    // Refresh blob URLs for all media from IndexedDB
    const refreshed = await Promise.all(
      courses.map(async (course) => ({
        ...course,
        videos: await Promise.all(
          course.videos.map(async (v) => ({
            ...v,
            blobUrl: (await mediaDB.getBlobUrl(v.id)) ?? '',
          }))
        ),
        images: await Promise.all(
          (course.images ?? []).map(async (img) => ({
            ...img,
            blobUrl: (await mediaDB.getBlobUrl(img.id)) ?? '',
          }))
        ),
      }))
    )

    return refreshed
  },

  create: async (title: string, category: string): Promise<CourseSummary> => {
    await delay()
    const courses = load()
    const newCourse: CourseSummary = {
      id: `c${Date.now()}`,
      title: title.trim(),
      category: category.trim() || 'General',
      students: 0,
      progress: 0,
      published: false,
      videos: [],
      images: [],
      documents: [],
    }
    saveWithoutBlobUrls([...courses, newCourse])
    return newCourse
  },

  togglePublish: (id: string): CourseSummary[] => {
    const courses = load()
    const updated = courses.map((c) =>
      c.id === id ? { ...c, published: !c.published } : c
    )
    saveWithoutBlobUrls(updated)
    return updated
  },

  delete: (id: string): CourseSummary[] => {
    // Also clean up IndexedDB entries for this course's media
    const courses = load()
    const target = courses.find((c) => c.id === id)
    if (target) {
      target.videos.forEach((v) => mediaDB.remove(v.id))
      target.images?.forEach((img) => mediaDB.remove(img.id))
    }
    const updated = courses.filter((c) => c.id !== id)
    saveWithoutBlobUrls(updated)
    return updated
  },

  // ── Videos ──────────────────────────────────────────────────────────────────

  addVideo: async (
    courseId: string,
    title: string,
    file: File
  ): Promise<CourseSummary[]> => {
    await delay()
    const videoId = `v${Date.now()}`

    // 1. Persist binary data to IndexedDB (survives page reloads)
    await mediaDB.store(videoId, file)

    // 2. Create fresh ObjectURL for current session
    const blobUrl = URL.createObjectURL(file)

    const courses = load()
    const updated = courses.map((c) => {
      if (c.id !== courseId) return c
      return {
        ...c,
        videos: [
          ...c.videos,
          {
            id: videoId,
            title: title.trim() || file.name,
            fileName: file.name,
            blobUrl, // valid this session; regenerated from IndexedDB on next load
            mimeType: file.type || 'video/mp4',
            fileSize: file.size,
            uploadedAt: new Date().toLocaleString(),
          },
        ],
      }
    })

    saveWithoutBlobUrls(updated) // don't persist the blob URL string
    return updated
  },

  removeVideo: (courseId: string, videoId: string): CourseSummary[] => {
    mediaDB.remove(videoId) // clean up IndexedDB
    const courses = load()
    const updated = courses.map((c) => {
      if (c.id !== courseId) return c
      return { ...c, videos: c.videos.filter((v) => v.id !== videoId) }
    })
    saveWithoutBlobUrls(updated)
    return updated
  },

  // ── Images ───────────────────────────────────────────────────────────────────

  addImage: async (
    courseId: string,
    title: string,
    file: File
  ): Promise<CourseSummary[]> => {
    await delay()
    const imageId = `img${Date.now()}_${Math.random().toString(36).slice(2)}`

    await mediaDB.store(imageId, file)
    const blobUrl = URL.createObjectURL(file)

    const courses = load()
    const updated = courses.map((c) => {
      if (c.id !== courseId) return c
      return {
        ...c,
        images: [
          ...(c.images ?? []),
          {
            id: imageId,
            title: title.trim() || file.name,
            fileName: file.name,
            blobUrl,
            mimeType: file.type || 'image/jpeg',
            fileSize: file.size,
            uploadedAt: new Date().toLocaleString(),
          },
        ],
      }
    })

    saveWithoutBlobUrls(updated)
    return updated
  },

  removeImage: (courseId: string, imageId: string): CourseSummary[] => {
    mediaDB.remove(imageId)
    const courses = load()
    const updated = courses.map((c) => {
      if (c.id !== courseId) return c
      return { ...c, images: (c.images ?? []).filter((img) => img.id !== imageId) }
    })
    saveWithoutBlobUrls(updated)
    return updated
  },

  // ── Documents ────────────────────────────────────────────────────────────────

  addDocument: async (
    courseId: string,
    title: string,
    file: File
  ): Promise<CourseSummary[]> => {
    await delay()
    // Documents use base64 (still feasible for PDFs/docs, usually <10 MB)
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    const courses = load()
    const updated = courses.map((c) => {
      if (c.id !== courseId) return c
      return {
        ...c,
        documents: [
          ...c.documents,
          {
            id: `d${Date.now()}`,
            title: title.trim() || file.name,
            fileName: file.name,
            base64,
            mimeType: file.type,
            fileSize: file.size,
            uploadedAt: new Date().toLocaleString(),
          },
        ],
      }
    })

    saveWithoutBlobUrls(updated)
    return updated
  },

  removeDocument: (courseId: string, docId: string): CourseSummary[] => {
    const courses = load()
    const updated = courses.map((c) => {
      if (c.id !== courseId) return c
      return { ...c, documents: c.documents.filter((d) => d.id !== docId) }
    })
    saveWithoutBlobUrls(updated)
    return updated
  },
}
