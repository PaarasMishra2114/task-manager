import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://heytooixxqxbyyjhcuej.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhleXRvb2l4eHF4Ynl5amhjdWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NjQ3OTMsImV4cCI6MjA4OTA0MDc5M30.80BJ7Xh0udGDkJnXsEiuHKwA-wbX7qsPiLlDa6jBubc'

export const hasSupabaseEnv = true

export const supabase = hasSupabaseEnv
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null
