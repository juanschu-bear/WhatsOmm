import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Reads the shared WhatsAnima Supabase (perception reports live in wa_perception_reports).
export const supabase = createClient(url, anon)
