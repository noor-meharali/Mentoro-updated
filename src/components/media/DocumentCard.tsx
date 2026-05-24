import React, { useState } from 'react'
import type { CourseDocument } from '../../context/course-context'
import { formatSize } from '../../services/courseService'

// ─── File type config ─────────────────────────────────────────────────────────
const FILE_TYPES: Record<string, { icon: string; color: string; label: string; preview: boolean }> = {
  'application/pdf': { icon: '📄', color: 'text-rose-400 bg-rose-500/10', label: 'PDF', preview: true },
  'application/msword': { icon: '📝', color: 'text-blue-400 bg-blue-500/10', label: 'DOC', preview: false },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    icon: '📝', color: 'text-blue-400 bg-blue-500/10', label: 'DOCX', preview: false,
  },
  'application/vnd.ms-powerpoint': { icon: '📊', color: 'text-orange-400 bg-orange-500/10', label: 'PPT', preview: false },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
    icon: '📊', color: 'text-orange-400 bg-orange-500/10', label: 'PPTX', preview: false,
  },
  'application/vnd.ms-excel': { icon: '📈', color: 'text-emerald-400 bg-emerald-500/10', label: 'XLS', preview: false },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    icon: '📈', color: 'text-emerald-400 bg-emerald-500/10', label: 'XLSX', preview: false,
  },
  'text/plain': { icon: '📃', color: 'text-slate-400 bg-slate-500/10', label: 'TXT', preview: true },
  'text/csv': { icon: '📈', color: 'text-emerald-400 bg-emerald-500/10', label: 'CSV', preview: false },
}

function getFileType(mimeType: string, fileName: string) {
  if (FILE_TYPES[mimeType]) return FILE_TYPES[mimeType]
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return FILE_TYPES['application/pdf']
  if (ext === 'txt') return FILE_TYPES['text/plain']
  if (ext === 'csv') return FILE_TYPES['text/csv']
  if (ext === 'pptx' || ext === 'ppt') return FILE_TYPES['application/vnd.ms-powerpoint']
  if (ext === 'xlsx' || ext === 'xls') return FILE_TYPES['application/vnd.ms-excel']
  if (ext === 'docx' || ext === 'doc') return FILE_TYPES['application/msword']
  return { icon: '📎', color: 'text-slate-400 bg-slate-500/10', label: ext?.toUpperCase() ?? 'FILE', preview: false }
}

// ─── DocumentCard ─────────────────────────────────────────────────────────────
interface DocumentCardProps {
  doc: CourseDocument
  onView?: (docId: string, title: string) => void
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ doc, onView }) => {
  const [previewOpen, setPreviewOpen] = useState(false)
  const ft = getFileType(doc.mimeType, doc.fileName)
  const canPreview = ft.preview && !!doc.base64

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-white/8 bg-slate-900/60 transition hover:border-emerald-500/20">
        <div className="flex items-center gap-3 p-4">
          {/* Icon */}
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${ft.color}`}>
            {ft.icon}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{doc.title}</p>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${ft.color}`}>{ft.label}</span>
              <span className="truncate">{doc.fileName}</span>
              {doc.fileSize > 0 && <span className="shrink-0 text-slate-500">· {formatSize(doc.fileSize)}</span>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            {canPreview && (
              <button
                onClick={() => {
                  onView?.(doc.id, doc.title)
                  setPreviewOpen(true)
                }}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/5"
              >
                Preview
              </button>
            )}
            <a
              href={doc.base64}
              download={doc.fileName}
              onClick={() => onView?.(doc.id, doc.title)}
              className="rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/25"
            >
              Download
            </a>
          </div>
        </div>
      </div>

      {/* Inline preview for PDF / TXT */}
      {previewOpen && canPreview && (
        <div className="rounded-2xl border border-white/10 bg-slate-950 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/8">
            <span className="text-sm text-slate-300 font-medium">{doc.title}</span>
            <button
              onClick={() => setPreviewOpen(false)}
              className="text-slate-400 hover:text-white text-sm transition"
            >
              ✕ Close
            </button>
          </div>
          {doc.mimeType === 'application/pdf' ? (
            <iframe
              src={doc.base64}
              className="w-full"
              style={{ height: '500px' }}
              title={doc.title}
            />
          ) : (
            <pre className="max-h-80 overflow-auto p-4 text-xs text-slate-300 whitespace-pre-wrap">
              {atob(doc.base64.split(',')[1] ?? '')}
            </pre>
          )}
        </div>
      )}
    </>
  )
}

export default DocumentCard
