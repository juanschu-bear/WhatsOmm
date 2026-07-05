import { createClient } from '@supabase/supabase-js'

interface SubscribeBody {
  subscription?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } }
  userId?: string | null
}

export async function POST(req: Request) {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return Response.json({ error: 'Supabase not configured' }, { status: 503 })

  let body: SubscribeBody
  try {
    body = (await req.json()) as SubscribeBody
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const sub = body.subscription
  if (!sub?.endpoint) return Response.json({ error: 'subscription required' }, { status: 400 })

  const supabase = createClient(url, key)
  const { error } = await supabase.from('wa_push_subscriptions').upsert(
    {
      user_id: body.userId ?? null,
      endpoint: sub.endpoint,
      p256dh: sub.keys?.p256dh ?? '',
      auth: sub.keys?.auth ?? '',
      source: 'whatsomm',
      created_at: new Date().toISOString(),
    },
    { onConflict: 'endpoint' },
  )

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
