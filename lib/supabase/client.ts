import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// ============================================
// SUPABASE CLIENT - Browser
// ============================================
// Untuk digunakan di client components (React components dengan "use client")

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return !!session
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Get current user with full profile
 */
export async function getCurrentUserProfile() {
  const user = await getCurrentUser()
  if (!user) return null

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()

  return profile
}

/**
 * Sign out
 */
export async function signOut() {
  await supabase.auth.signOut()
}

// ============================================
// STORAGE HELPERS
// ============================================

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  options?: {
    cacheControl?: string
    upsert?: boolean
  },
) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: options?.cacheControl || '3600',
    upsert: options?.upsert || false,
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Get public URL for file
 */
export function getPublicUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Download file from storage
 */
export async function downloadFile(bucket: string, path: string) {
  const { data, error } = await supabase.storage.from(bucket).download(path)

  if (error) {
    throw error
  }

  return data
}

/**
 * Delete file from storage
 */
export async function deleteFile(bucket: string, paths: string | string[]) {
  const pathsArray = Array.isArray(paths) ? paths : [paths]

  const { data, error } = await supabase.storage.from(bucket).remove(pathsArray)

  if (error) {
    throw error
  }

  return data
}

// ============================================
// REALTIME HELPERS
// ============================================

/**
 * Subscribe to table changes
 */
export function subscribeToTable<T = any>(
  table: string,
  callback: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE'
    new: T
    old: T
  }) => void,
  filter?: string,
) {
  const channel = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
        filter: filter,
      },
      callback as any,
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Subscribe to proposal changes
 */
export function subscribeToProposal(proposalId: string, callback: (proposal: any) => void) {
  return subscribeToTable('proposals', (payload) => {
    if (payload.new.id === proposalId) {
      callback(payload.new)
    }
  })
}

// ============================================
// EXPORTS
// ============================================

export default supabase
