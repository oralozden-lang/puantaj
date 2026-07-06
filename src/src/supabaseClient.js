import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xbbkwdbdeffkqzjhpfyg.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_ZLtqydgqPq9dpy_Ybuweqw_y78308xO'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

export const EMAIL_DOMAIN = 'personel.local'
export function usernameToEmail(username) {
  return `${username.trim().toLowerCase()}@${EMAIL_DOMAIN}`
}
