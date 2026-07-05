import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

interface NotifyBody {
  userId?: string | null
  title?: string
  body?: string
  url?: string
}

interface StoredSubscription {
  endpoint: string
  subscription: webpush.PushSubscription
}

export async function POST(req: Request) {
  const pub = process.env.VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  const email = process.env.VAPID_EMAIL ?? 'mailto:join@onioko.com'
  if (!pub || !priv) return Response.json({ error: 'VAPID not configured' }, { status: 503 })
  webpush.setVapidDetails(email, pub, priv)

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return Response.json({ error: 'Supabase not configured' }, { status: 503 })

  let body: NotifyBody
  try {
    body = (await req.json()) as NotifyBody
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const supabase = createClient(url, key)
  let query = supabase.from('wa_push_subscriptions').select('endpoint, subscription').eq('source', 'whatsomm')
  if (body.userId) query = query.eq('user_id', body.userId)
  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })

  const subs = (data ?? []) as StoredSubscription[]
  const payload = JSON.stringify({
    title: body.title ?? 'WhatsOmm',
    body: body.body ?? 'Ein Gespräch ist beendet, die Auswertung ist da.',
    url: body.url ?? '/',
  })

  let sent = 0
  await Promise.all(
    subs.map(async (row) => {
      try {
        await webpush.sendNotification(row.subscription, payload)
        sent += 1
      } catch {
        /* stale subscriptions are cleaned up by the shared maintenance job */
      }
    }),
  )

  return Response.json({ sent })
}
