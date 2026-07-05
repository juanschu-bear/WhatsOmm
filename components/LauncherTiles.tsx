'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const buffer = new ArrayBuffer(raw.length)
  const out = new Uint8Array(buffer)
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i)
  return out
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type NotifyState = 'idle' | 'on' | 'error' | 'unsupported'

export default function LauncherTiles() {
  const router = useRouter()
  const [notify, setNotify] = useState<NotifyState>('idle')
  const [installEvt, setInstallEvt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const supportsPush =
      window.isSecureContext &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    if (!supportsPush) {
      setNotify('unsupported')
    } else if (window.Notification.permission === 'granted') {
      setNotify('on')
    }
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setInstallEvt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  async function enableNotifications() {
    try {
      if (
        typeof window === 'undefined' ||
        !window.isSecureContext ||
        !('serviceWorker' in navigator) ||
        !('PushManager' in window) ||
        !('Notification' in window)
      ) {
        setNotify('unsupported')
        return
      }
      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!key) { setNotify('error'); return }
      const reg = await navigator.serviceWorker.ready
      const permission = await window.Notification.requestPermission()
      if (permission !== 'granted') { setNotify('error'); return }
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      })
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      })
      setNotify(res.ok ? 'on' : 'error')
    } catch {
      setNotify('error')
    }
  }

  async function install() {
    if (!installEvt) return
    await installEvt.prompt()
    await installEvt.userChoice
    setInstallEvt(null)
  }

  const notifyHint =
    notify === 'on' ? 'Aktiv' :
    notify === 'unsupported' ? 'Browser nicht unterst\u00fctzt' :
    notify === 'error' ? 'Erneut versuchen' :
    'Push bei neuer Auswertung'

  return (
    <>
      <button type="button" className="tile gold" onClick={enableNotifications} disabled={notify === 'unsupported'}>
        <span className="ic">{notify === 'on' ? '\u2713' : '\ud83d\udd14'}</span>
        <span className="lb">Benachrichtigungen</span>
        <span className="hint">{notifyHint}</span>
      </button>

      <button type="button" className="tile" onClick={install} disabled={!installEvt}>
        <span className="ic">&#10515;</span>
        <span className="lb">Installieren</span>
        <span className="hint">{installEvt ? 'Auf den Homescreen' : 'Im Browser-Men\u00fc'}</span>
      </button>

      <button type="button" className="tile" onClick={() => router.refresh()}>
        <span className="ic">&#8635;</span>
        <span className="lb">Aktualisieren</span>
        <span className="hint">Auf neue Auswertungen pr\u00fcfen</span>
      </button>
    </>
  )
}
