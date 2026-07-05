'use client'

import { useEffect, useState } from 'react'

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const buffer = new ArrayBuffer(raw.length)
  const out = new Uint8Array(buffer)
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i)
  return out
}

export default function PushOptIn() {
  const [state, setState] = useState<'idle' | 'on' | 'unsupported' | 'error'>('idle')

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) setState('unsupported')
  }, [])

  async function enable() {
    try {
      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!key) {
        setState('error')
        return
      }
      const reg = await navigator.serviceWorker.ready
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setState('error')
        return
      }
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      })
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
      })
      setState(res.ok ? 'on' : 'error')
    } catch {
      setState('error')
    }
  }

  if (state === 'unsupported') {
    return <span style={{ color: '#6b7688', fontSize: 13 }}>Push wird von diesem Browser nicht unterstützt.</span>
  }
  if (state === 'on') {
    return <span style={{ color: '#7fdca0', fontSize: 14, fontWeight: 600 }}>✓ Benachrichtigungen aktiv</span>
  }
  return (
    <button
      onClick={enable}
      style={{
        fontSize: 14,
        fontWeight: 600,
        color: '#06231f',
        background: '#70f0de',
        border: 'none',
        padding: '11px 18px',
        borderRadius: 12,
        cursor: 'pointer',
        boxShadow: '0 0 18px rgba(112,240,222,0.3)',
      }}
    >
      Benachrichtigungen aktivieren
    </button>
  )
}
