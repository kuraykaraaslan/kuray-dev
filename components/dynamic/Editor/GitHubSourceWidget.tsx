'use client'

import { useState, useEffect, useRef } from 'react'
import axiosInstance from '@/libs/axios'

interface LinkedPromotion {
  id: string
  repoFullName: string
  repoUrl: string
  content: string
  fileLastModifiedAt: string
}

interface PromotionOption {
  id: string
  repoFullName: string
  dynamicPageId: string | null
}

interface Props {
  pageId: string
}

export default function GitHubSourceWidget({ pageId }: Props) {
  const [linked, setLinked] = useState<LinkedPromotion | null>(null)
  const [all, setAll] = useState<PromotionOption[]>([])
  const [open, setOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [linking, setLinking] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isCreate = pageId === 'create'

  useEffect(() => {
    if (isCreate) return
    axiosInstance
      .get(`/api/dynamic-pages/${pageId}/github-source`)
      .then((res) => {
        setLinked(res.data.linked)
        setAll(res.data.all)
      })
      .catch(() => {})
  }, [pageId, isCreate])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const flash = (type: 'success' | 'error', msg: string) => {
    setStatus({ type, msg })
    setTimeout(() => setStatus(null), 3000)
  }

  const linkPromotion = async (promotionId: string | null) => {
    setLinking(true)
    try {
      // Unlink previous if different
      if (linked) {
        await axiosInstance.patch(`/api/github-promote/${linked.id}`, { dynamicPageId: null })
      }
      if (promotionId) {
        const res = await axiosInstance.patch(`/api/github-promote/${promotionId}`, {
          dynamicPageId: pageId,
        })
        setLinked(res.data.promotion ? {
          id: res.data.promotion.id,
          repoFullName: res.data.promotion.repoFullName,
          repoUrl: res.data.promotion.repoUrl,
          content: res.data.promotion.content,
          fileLastModifiedAt: res.data.promotion.fileLastModifiedAt,
        } : null)
      } else {
        setLinked(null)
      }
      // Refresh all list to update which ones are taken
      const src = await axiosInstance.get(`/api/dynamic-pages/${pageId}/github-source`)
      setAll(src.data.all)
      setOpen(false)
      flash('success', promotionId ? 'Linked' : 'Unlinked')
    } catch {
      flash('error', 'Failed')
    } finally {
      setLinking(false)
    }
  }

  const regenerate = async () => {
    if (!linked) return
    setGenerating(true)
    setOpen(false)
    try {
      await axiosInstance.post(`/api/github-promote/${linked.id}/generate`)
      flash('success', 'Page regenerated — reload to see changes')
    } catch (err: any) {
      flash('error', err.response?.data?.message ?? 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  if (isCreate) return null

  return (
    <div className="relative flex items-center gap-2 flex-shrink-0" ref={dropdownRef}>
      {/* Status flash */}
      {status && (
        <span
          className="text-xs px-2 py-1 rounded"
          style={{
            backgroundColor: status.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            color: status.type === 'success' ? '#4ade80' : '#f87171',
          }}
        >
          {status.msg}
        </span>
      )}

      {/* Trigger button */}
      <button
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
        style={{
          backgroundColor: linked ? 'rgba(255,196,24,0.1)' : 'rgba(255,255,255,0.06)',
          border: linked ? '1px solid rgba(255,196,24,0.3)' : '1px solid rgba(255,255,255,0.1)',
          color: linked ? '#ffc418' : 'rgba(255,255,255,0.5)',
        }}
        onClick={() => setOpen((v) => !v)}
        disabled={generating || linking}
      >
        {generating ? (
          <span className="loading loading-spinner loading-xs" />
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        )}
        {linked ? linked.repoFullName.split('/')[1] : 'No source'}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute top-full right-0 mt-1.5 w-72 rounded-xl shadow-2xl z-50"
          style={{ backgroundColor: '#1a1818', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {/* Current source info */}
          <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs font-semibold text-white mb-1">GitHub Source</p>
            {linked ? (
              <>
                <a
                  href={linked.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs hover:text-yellow-400 transition-colors"
                  style={{ color: '#ffc418' }}
                >
                  {linked.repoFullName} ↗
                </a>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Last modified {new Date(linked.fileLastModifiedAt).toLocaleDateString()}
                </p>
              </>
            ) : (
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>No promotion linked</p>
            )}
          </div>

          {/* Picker */}
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Link a promotion</p>
            <select
              className="w-full rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              defaultValue={linked?.id ?? ''}
              onChange={(e) => linkPromotion(e.target.value || null)}
              disabled={linking}
            >
              <option value="">— Unlink —</option>
              {all.map((p) => (
                <option
                  key={p.id}
                  value={p.id}
                  disabled={!!p.dynamicPageId && p.dynamicPageId !== pageId}
                >
                  {p.repoFullName}
                  {p.dynamicPageId && p.dynamicPageId !== pageId ? ' (linked elsewhere)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Regenerate */}
          {linked && (
            <div className="px-4 py-3">
              <button
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  backgroundColor: 'rgba(255,196,24,0.1)',
                  border: '1px solid rgba(255,196,24,0.25)',
                  color: '#ffc418',
                }}
                onClick={regenerate}
                disabled={generating}
              >
                {generating ? (
                  <><span className="loading loading-spinner loading-xs" /> Generating…</>
                ) : (
                  '✦ Regenerate page from promote.md'
                )}
              </button>
              <p className="text-xs mt-2 text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Overwrites blocks. Reload after generation.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
