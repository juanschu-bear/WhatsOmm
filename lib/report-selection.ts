import type { SupabaseClient } from '@supabase/supabase-js'
import type { PerceptionReportData } from './perception-report'

export async function loadStoredReport(client: SupabaseClient, conversationId: string, reportId?: string): Promise<PerceptionReportData | null> {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuid.test(conversationId) || (reportId !== undefined && !uuid.test(reportId))) return null
  let query = client.from('wa_perception_reports').select('report').eq('conversation_id', conversationId)
  if (reportId) query = query.eq('id', reportId)
  // Legacy notification links have only a conversation ID. Resolve the latest
  // report deterministically; never demand that the conversation has one row.
  const { data, error } = await query.order('call_started_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false }).order('id', { ascending: false }).limit(1).maybeSingle()
  if (error) throw new Error('report_lookup_failed')
  return data?.report ?? null
}
