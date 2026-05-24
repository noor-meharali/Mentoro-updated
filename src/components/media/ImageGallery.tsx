import React, { useState, useEffect, useCallback, useRef } from 'react'
import type { CourseImage } from '../../context/course-context'
import { formatSize } from '../../services/courseService'

// ─── Lightbox ─────────────────────────────────────────────────────────────────
interface LightboxProps {
  images: CourseImage[]
  startIndex: number
  onClose: () => void
}

const Lightbox: React.FC<LightboxProps> = ({ images, startIndex, onClose }) => {
  const [idx, setIdx] = useState(startIndex)
  const [zoom, setZoom] = useState(1)
  const [dragging, setDragging] = useState(false)
  const touchStartX = useRef(0)

  const prev = useCallback(() => { setIdx((i) => (i - 1 + images.length) % images.length); setZoom(1) }, [images.length])
  const next = useCallback(() => { setIdx((i) => (i + 1) % images.length); setZoom(1) }, [images.length])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose, prev, next])

  const current = images[idx]

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    setDragging(false)
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 50) {
      if (dx > 0) prev(); else next()
    }
  }

  if (!current) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !dragging) onClose() }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
      </button>

      {/* Navigation */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" />
            </svg>
          </button>
        </>
      )}

      {/* Image */}
      <div className="flex max-h-[90vh] max-w-[90vw] flex-col items-center gap-3">
        <div
          className="overflow-hidden rounded-xl"
          style={{ cursor: zoom > 1 ? 'zoom-out' : 'zoom-in' }}
          onClick={() => setZoom((z) => (z >= 2 ? 1 : z + 0.5))}
          onMouseMove={(e) => setDragging(e.buttons > 0)}
        >
          <img
            src={current.blobUrl}
            alt={current.title}
            style={{
              maxHeight: '80vh',
              maxWidth: '85vw',
              transform: `scale(${zoom})`,
              transition: 'transform 0.2s',
              transformOrigin: 'center',
            }}
            className="object-contain"
            draggable={false}
          />
        </div>

        {/* Caption + controls */}
        <div className="flex w-full items-center justify-between gap-4 px-1">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{current.title}</p>
            <p className="text-xs text-slate-400">
              {current.fileName}
              {current.fileSize > 0 && <span className="ml-2">· {formatSize(current.fileSize)}</span>}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {/* Zoom buttons */}
            <button
              onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white text-sm transition hover:bg-white/20"
            >
              −
            </button>
            <span className="text-xs text-slate-400 font-mono w-8 text-center">{zoom}×</span>
            <button
              onClick={() => setZoom((z) => Math.min(3, z + 0.5))}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white text-sm transition hover:bg-white/20"
            >
              +
            </button>
            {/* Download */}
            <a
              href={current.blobUrl}
              download={current.fileName}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 transition hover:bg-cyan-500/30"
              title="Download"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>

        {/* Dots */}
        {images.length > 1 && (
          <div className="flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => { setIdx(i); setZoom(1) }}
                className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-5 bg-cyan-400' : 'w-1.5 bg-white/30'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── ImageGrid ────────────────────────────────────────────────────────────────
interface ImageGridProps {
  images: CourseImage[]
  onView?: (imageId: string, title: string) => void
}

export const ImageGallery: React.FC<ImageGridProps> = ({ images, onView }) => {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  if (images.length === 0) return null

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => {
              onView?.(img.id, img.title)
              setLightboxIdx(i)
            }}
            className="group relative aspect-square overflow-hidden rounded-xl bg-slate-900 transition hover:ring-2 hover:ring-cyan-500/50"
          >
            {img.blobUrl ? (
              <img
                src={img.blobUrl}
                alt={img.title}
                loading="lazy"
                className="h-full w-full object-cover transition group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-600">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent opacity-0 transition group-hover:opacity-100 p-2">
              <p className="truncate text-xs text-white">{img.title}</p>
            </div>
          </button>
        ))}
      </div>

      {lightboxIdx !== null && (
        <Lightbox
          images={images}
          startIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  )
}

export default ImageGallery
