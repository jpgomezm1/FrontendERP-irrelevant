
import { createClient } from '@supabase/supabase-js'

// Use fallback values if environment variables are not available yet
// When the Lovable-Supabase connection is established, these will be properly set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key'

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

