'use client'

import { useEffect } from 'react'
import axiosInstance from '@/libs/axios'

interface Props {
  postId: string
}

// Module-level guard so React strict-mode's double-mount (dev) doesn't double-count.
const beaconed = new Set<string>()

/**
 * Fires a single view-count beacon per page load. Counting was moved off the
 * server render so it tracks real client page loads (not bot/prefetch HTML
 * fetches) and keeps the page render free of side effects.
 */
export default function PostViewBeacon({ postId }: Props) {
  useEffect(() => {
    if (!postId || beaconed.has(postId)) return
    beaconed.add(postId)
    axiosInstance.post(`/api/posts/${postId}/view`).catch(() => undefined)
  }, [postId])

  return null
}
