'use client'

import { useEffect } from 'react'
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals'

type MetricName = 'CLS' | 'INP' | 'LCP' | 'FCP' | 'TTFB'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

function sendToGA4(metric: { name: MetricName; value: number; rating: string; id: string }) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', metric.name, {
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    metric_rating: metric.rating,
    metric_id: metric.id,
    non_interaction: true,
  })
}

function sendToRUM(metric: { name: MetricName; value: number; rating: string; id: string }) {
  const body = JSON.stringify({ name: metric.name, value: metric.value, rating: metric.rating, id: metric.id })
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/vitals-collect', new Blob([body], { type: 'application/json' }))
  } else {
    fetch('/api/vitals-collect', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'application/json' } }).catch(() => {})
  }
}

function report(metric: { name: MetricName; value: number; rating: string; id: string }) {
  sendToGA4(metric)
  sendToRUM(metric)
}

export default function WebVitals() {
  useEffect(() => {
    onCLS(report)
    onINP(report)
    onLCP(report)
    onFCP(report)
    onTTFB(report)
  }, [])

  return null
}
