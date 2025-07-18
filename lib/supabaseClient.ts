import { createClient } from '@supabase/supabase-js'

// 1. Get the Supabase URL and public anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

// 2. Check if the variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and/or anon key are not set in .env.local')
}

// 3. Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)