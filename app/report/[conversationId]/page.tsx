import PerceptionReport from '@/components/PerceptionReport'
import { SAMPLE_REPORT } from '@/lib/perception-report'

export default async function ReportPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const { conversationId } = await params
  // MVP: renders the fixture. The Supabase read of wa_perception_reports for
  // this conversationId is wired once the shared backend table exists.
  const data = { ...SAMPLE_REPORT, ref: conversationId || SAMPLE_REPORT.ref }
  return <PerceptionReport data={data} />
}
