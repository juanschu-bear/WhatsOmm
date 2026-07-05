'use client'

import { useEffect } from 'react'

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return
    if (!window.isSecureContext || !('serviceWorker' in navigator)) return

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* registration failures are non-fatal for viewing reports */
      })
    }

    const onLoad = () => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(register)
      } else {
        globalThis.setTimeout(register, 0)
      }
    }

    if (document.readyState === 'complete') {
      onLoad()
      return
    }

    window.addEventListener('load', onLoad, { once: true })
    return () => window.removeEventListener('load', onLoad)
  }, [])
  return null
}
