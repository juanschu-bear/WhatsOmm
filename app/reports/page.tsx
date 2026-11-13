import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

interface ReportRow {
  id: string
  conversation_id: string
  created_at: string
  report: {
    guest?: { name?: string; company?: string }
    congruence?: { score?: number }
  } | null
}

async function loadReports(): Promise<ReportRow[]> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('report_store_unavailable')
  try {
    const supabase = createClient(url, key)
    const { data, error } = await supabase
      .from('wa_perception_reports')
      .select('id, conversation_id, created_at, report')
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw new Error('report_list_failed')
    return (data ?? []) as ReportRow[]
  } catch {
    throw new Error('report_list_failed')
  }
}

export default async function ReportsPage() {
  let rows: ReportRow[]
  try { rows = await loadReports() }
  catch { return <main className="reports"><h1>Auswertungen konnten nicht geladen werden</h1><p>Bitte versuche es später erneut.</p></main> }
  return (
    <main className="reports">
      <div className="rp-head">
        <Link href="/" className="rp-back">&#8592; WhatsOmm</Link>
        <h1>Auswertungen</h1>
        <span className="rp-count">{rows.length}</span>
      </div>

      {rows.length === 0 ? (
        <div className="rp-empty">
          <p>Noch keine Auswertungen.</p>
          <p>Nach einem Gespr&auml;ch ab 90 Sekunden erscheint die Auswertung automatisch hier.</p>
        </div>
      ) : (
        <ul className="rp-list">
          {rows.map((r) => {
            const g = r.report?.guest
            const score = r.report?.congruence?.score
            const when = new Date(r.created_at).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Berlin' })
            return (
              <li key={r.id}>
                <Link href={`/report/${r.conversation_id}?reportId=${r.id}`} className="rp-item">
                  <div className="rp-main">
                    <div className="rp-name">{g?.name ?? r.conversation_id}</div>
                    <div className="rp-sub">{[g?.company, when].filter(Boolean).join(' \u00b7 ')}</div>
                  </div>
                  {typeof score === 'number' && <div className="rp-score">{score}%</div>}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
