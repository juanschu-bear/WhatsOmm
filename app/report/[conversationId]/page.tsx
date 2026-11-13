import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import PerceptionReport from '@/components/PerceptionReport'
import { loadStoredReport } from '@/lib/report-selection'

export const dynamic = 'force-dynamic'

export default async function ReportPage({ params, searchParams }: {
  params: Promise<{ conversationId: string }>
  searchParams: Promise<{ reportId?: string | string[] }>
}) {
  const { conversationId } = await params
  const { reportId } = await searchParams
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  let data = null
  let failed = false
  try {
    if (!url || !key) throw new Error('report_store_unavailable')
    data = await loadStoredReport(createClient(url, key), conversationId,
      Array.isArray(reportId) ? '' : reportId)
  } catch {
    failed = true
  }
  if (!data) return <main className="reports"><h1>{failed ? 'Auswertung konnte nicht geladen werden' : 'Auswertung nicht gefunden'}</h1>
    <p>{failed ? 'Bitte versuche es später erneut.' : 'Für diesen Aufruf ist keine gespeicherte Auswertung verfügbar.'}</p>
    <Link href="/reports">Zurück zu den Auswertungen</Link></main>
  return <PerceptionReport data={data} />
}
