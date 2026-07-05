import { createClient } from '@supabase/supabase-js'
import PerceptionReport from '@/components/PerceptionReport'
import { SAMPLE_REPORT, type PerceptionReportData } from '@/lib/perception-report'

// Reads a stored report from wa_perception_reports. The conversation_id in the
// URL acts as an unguessable capability (share-link style) for the MVP; proper
// auth/RLS gating is a follow-up.
async function loadReport(conversationId: string): Promise<PerceptionReportData | null> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  try {
    const supabase = createClient(url, key)
    const { data, error } = await supabase
      .from('wa_perception_reports')
      .select('report')
      .eq('conversation_id', conversationId)
      .maybeSingle()
    if (error || !data) return null
    return data.report as PerceptionReportData
  } catch {
    return null
  }
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const { conversationId } = await params
  const loaded = await loadReport(conversationId)
  const data = loaded ?? { ...SAMPLE_REPORT, ref: conversationId || SAMPLE_REPORT.ref }
  return <PerceptionReport data={data} />
}
