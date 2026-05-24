import React, { useRef, useState, useEffect, useCallback } from 'react'
import type { CourseVideo } from '../../context/course-context'
import { formatSize } from '../../services/courseService'

// ─── Icons (inline SVG, no external deps) ────────────────────────────────────
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M8 5v14l11-7z" />
  </svg>
)
const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
)
const VolumeIcon = ({ muted, level }: { muted: boolean; level: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    {muted || level === 0 ? (
      <path d="M16.5 12A4.5 4.5 0 0014 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0013 19.73l2.73 2.73L17 21.46 5.27 9.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
    ) : level < 0.5 ? (
      <path d="M18.5 12A4.5 4.5 0 0016 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
    ) : (
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    )}
  </svg>
)
const FullscreenIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
  </svg>
)
const ExitFullscreenIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
  </svg>
)

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtTime(s: number): string {
  if (!isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

// ─── VideoPlayer ──────────────────────────────────────────────────────────────
interface VideoPlayerProps {
  video: CourseVideo
  initialPositionSeconds?: number
  maxAllowedSeekSeconds?: number
  onWatchProgress?: (currentSeconds: number, durationSeconds: number) => void
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  initialPositionSeconds = 0,
  maxAllowedSeekSeconds,
  onWatchProgress,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const controlsTimerRef = useRef<number | null>(null)
  const lastProgressSaveRef = useRef(0)
  const restoredRef = useRef(false)

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [buffered, setBuffered] = useState(0)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [open, setOpen] = useState(false)

  // Auto-hide controls during playback
  const resetControlsTimer = useCallback(() => {
    setShowControls(true)
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
    if (playing) {
      controlsTimerRef.current = window.setTimeout(() => setShowControls(false), 3000)
    }
  }, [playing])

  useEffect(() => () => { if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current) }, [])

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }, [])

  // Keyboard shortcuts when open
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      const v = videoRef.current
      if (!v) return
      if (e.code === 'Space') { e.preventDefault(); if (v.paused) v.play(); else v.pause() }
      if (e.code === 'ArrowRight') { e.preventDefault(); v.currentTime = Math.min(v.currentTime + 10, v.duration) }
      if (e.code === 'ArrowLeft') { e.preventDefault(); v.currentTime = Math.max(v.currentTime - 10, 0) }
      if (e.code === 'KeyM') setMuted((m) => { v.muted = !m; return !m })
      if (e.code === 'KeyF') toggleFullscreen()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, toggleFullscreen])

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const handlePlayPause = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play()
    else v.pause()
    resetControlsTimer()
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current
    const bar = progressRef.current
    if (!v || !bar || !duration) return
    const rect = bar.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    v.currentTime = ratio * duration
    resetControlsTimer()
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current
    if (!v) return
    const val = parseFloat(e.target.value)
    setVolume(val)
    v.volume = val
    setMuted(val === 0)
    v.muted = val === 0
  }

  const handleSpeedChange = (s: number) => {
    const v = videoRef.current
    if (v) v.playbackRate = s
    setSpeed(s)
  }

  const handleOpen = () => {
    setOpen(true)
    setStatus('loading')
  }

  const handleClose = () => {
    const v = videoRef.current
    if (v && duration > 0) onWatchProgress?.(v.currentTime, duration)
    if (v) v.pause()
    setOpen(false)
    setPlaying(false)
  }

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0
  const bufferedPct = buffered

  if (!video.blobUrl) {
    return (
      <div className="rounded-2xl bg-slate-900/60 border border-white/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/20">
            <span className="text-lg">⚠️</span>
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-white">{video.title}</p>
            <p className="text-xs text-rose-400">
              Video not found. Please re-upload this video.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-slate-900/60 transition-all hover:border-cyan-500/20">
      {/* Collapsed header */}
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12zm-5-6l-7 4V7z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{video.title}</p>
            <p className="text-xs text-slate-400">
              {video.fileName}
              {video.fileSize > 0 && <span className="ml-2 text-slate-500">· {formatSize(video.fileSize)}</span>}
            </p>
          </div>
        </div>
        <button
          onClick={open ? handleClose : handleOpen}
          className="shrink-0 rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 active:scale-95"
        >
          {open ? 'Close' : '▶ Watch'}
        </button>
      </div>

      {/* Expanded player */}
      {open && (
        <div
          ref={containerRef}
          className="relative bg-black select-none"
          onMouseMove={resetControlsTimer}
          onMouseLeave={() => playing && setShowControls(false)}
          style={{ cursor: showControls || !playing ? 'default' : 'none' }}
        >
          {/* Loading skeleton */}
          {status === 'loading' && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />
                <p className="text-xs text-slate-400">Loading video…</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {status === 'error' && (
            <div className="flex min-h-[200px] items-center justify-center bg-slate-950">
              <div className="text-center">
                <p className="text-4xl">⚠️</p>
                <p className="mt-2 text-sm text-slate-300">Unable to play this video</p>
                <p className="mt-1 text-xs text-slate-500">Format may be unsupported in this browser</p>
              </div>
            </div>
          )}

          {/* Video element */}
          <video
            ref={videoRef}
            src={video.blobUrl}
            className="w-full"
            style={{ maxHeight: isFullscreen ? '100vh' : '420px', display: status === 'error' ? 'none' : 'block' }}
            onClick={handlePlayPause}
            onLoadStart={() => setStatus('loading')}
            onCanPlay={() => setStatus('ready')}
            onError={() => setStatus('error')}
            onPlay={() => { setPlaying(true); resetControlsTimer() }}
            onPause={() => { setPlaying(false); setShowControls(true) }}
            onTimeUpdate={() => {
              const v = videoRef.current
              if (!v) return
              setCurrentTime(v.currentTime)
              if (duration > 0 && Math.abs(v.currentTime - lastProgressSaveRef.current) >= 3) {
                lastProgressSaveRef.current = v.currentTime
                onWatchProgress?.(v.currentTime, duration)
              }
              if (v.buffered.length > 0) {
                setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100)
              }
            }}
            onSeeking={() => {
              const v = videoRef.current
              if (!v || maxAllowedSeekSeconds === undefined) return
              const allowed = Math.min(v.duration || Number.POSITIVE_INFINITY, maxAllowedSeekSeconds + 8)
              if (v.currentTime > allowed) v.currentTime = allowed
            }}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setDuration(videoRef.current.duration)
                if (!restoredRef.current && initialPositionSeconds > 0) {
                  videoRef.current.currentTime = Math.min(initialPositionSeconds, Math.max(0, videoRef.current.duration - 2))
                  restoredRef.current = true
                }
              }
            }}
            onEnded={() => {
              if (videoRef.current) onWatchProgress?.(videoRef.current.duration, videoRef.current.duration)
              setPlaying(false)
              setShowControls(true)
            }}
            preload="metadata"
          />

          {/* Controls overlay */}
          {status === 'ready' && (
            <div
              className="absolute inset-x-0 bottom-0 transition-opacity duration-300"
              style={{ opacity: showControls ? 1 : 0 }}
            >
              {/* Gradient */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 to-transparent" />

              <div className="relative px-3 pb-3 pt-2">
                {/* Progress bar */}
                <div
                  ref={progressRef}
                  className="group relative mb-2.5 h-1 cursor-pointer rounded-full bg-white/20 hover:h-1.5 transition-all"
                  onClick={handleSeek}
                >
                  {/* Buffered */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-white/30"
                    style={{ width: `${bufferedPct}%` }}
                  />
                  {/* Played */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-cyan-400"
                    style={{ width: `${progressPct}%` }}
                  />
                  {/* Thumb */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    style={{ left: `${progressPct}%`, transform: 'translateY(-50%) translateX(-50%)' }}
                  />
                </div>

                {/* Bottom row */}
                <div className="flex items-center gap-2">
                  {/* Play/pause */}
                  <button
                    onClick={handlePlayPause}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:bg-white/15 active:scale-90"
                  >
                    {playing ? <PauseIcon /> : <PlayIcon />}
                  </button>

                  {/* Volume */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        const v = videoRef.current
                        if (!v) return
                        const next = !muted
                        setMuted(next)
                        v.muted = next
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition hover:bg-white/15 hover:text-white"
                    >
                      <VolumeIcon muted={muted} level={volume} />
                    </button>
                    <input
                      type="range"
                      min={0} max={1} step={0.05}
                      value={muted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-white/20 accent-cyan-400 sm:w-20"
                    />
                  </div>

                  {/* Time */}
                  <span className="ml-1 text-xs font-mono text-white/60">
                    {fmtTime(currentTime)} / {fmtTime(duration)}
                  </span>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Speed */}
                  <div className="relative group/speed">
                    <button className="rounded px-2 py-1 text-xs text-white/70 transition hover:bg-white/15 hover:text-white font-mono">
                      {speed}x
                    </button>
                    <div className="absolute bottom-full right-0 mb-1 hidden group-hover/speed:flex flex-col overflow-hidden rounded-xl bg-slate-900 border border-white/10 shadow-2xl">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSpeedChange(s)}
                          className={`px-4 py-1.5 text-xs transition hover:bg-white/10 font-mono ${speed === s ? 'text-cyan-400' : 'text-white/70'}`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition hover:bg-white/15 hover:text-white"
                  >
                    {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default VideoPlayer
