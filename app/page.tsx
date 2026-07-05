import Link from 'next/link'
import PushOptIn from '@/components/PushOptIn'

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 20,
        maxWidth: 720,
        margin: '0 auto',
        padding: '48px 28px',
        fontFamily: 'system-ui, sans-serif',
        background:
          'radial-gradient(900px 600px at 85% -8%, rgba(112,240,222,0.07), transparent 60%), #080b11',
      }}
    >
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 2, color: '#70f0de', textTransform: 'uppercase' }}>
        ONIOKO · Observational Perception
      </div>
      <h1 style={{ fontSize: 44, lineHeight: 1.05, margin: 0, color: '#eef2f8', fontFamily: 'Georgia, serif' }}>
        WhatsOmm
      </h1>
      <p style={{ color: '#9aa6b8', fontSize: 17, maxWidth: 560, margin: 0 }}>
        Wenn ein Gespräch endet, liest WhatsOmm es auf zwei Ebenen: was gesagt wurde, und ob das Gesagte und das Gezeigte zusammenhielten. Aktiviere Benachrichtigungen, dann bist du sofort dabei, wenn eine Auswertung bereitsteht.
      </p>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
        <PushOptIn />
        <Link href="/report/kf-33738551" style={{ color: '#d8c290', fontSize: 14, textDecoration: 'none', borderBottom: '1px solid rgba(216,194,144,0.4)' }}>
          Beispiel-Report ansehen
        </Link>
      </div>
      <div style={{ marginTop: 40, fontSize: 12, color: '#6b7688' }}>
        OPM erkennt Signal-Kongruenz, keine emotionalen Zustände. Verarbeitung auf EU-Servern.
      </div>
    </main>
  )
}
