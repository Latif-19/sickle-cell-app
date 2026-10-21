import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.warn('⚠️ Warning: SUPABASE_URL is not defined in environment variables.');
}

if (!supabaseAnonKey) {
  console.warn('⚠️ Warning: SUPABASE_ANON_KEY is not defined in environment variables.');
}

/**
 * Standard Supabase client using Anon key.
 * Adheres to Row Level Security (RLS) policies.
 */
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Admin Supabase client using Service Role key.
 * Bypasses Row Level Security (RLS) policies. Use strictly on backend for admin tasks.
 */
export const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;
