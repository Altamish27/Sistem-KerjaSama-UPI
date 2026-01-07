import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// ============================================
// SUPABASE ADMIN CLIENT - Server Only
// ============================================
// PENTING: Hanya gunakan di server-side (API routes, Server Components)
// JANGAN PERNAH expose ke client!

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase service role environment variables')
}

export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// ============================================
// ADMIN OPERATIONS
// ============================================

/**
 * Create new user (bypass RLS)
 */
export async function createUser(userData: {
  email: string
  password: string
  name: string
  role: string
  institution?: string
  fakultas?: string
}) {
  // Create auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    email_confirm: true,
  })

  if (authError) {
    throw authError
  }

  // Create user profile
  const { data: profileData, error: profileError } = await supabaseAdmin
    .from('users')
    .insert({
      id: authData.user!.id,
      email: userData.email,
      name: userData.name,
      role: userData.role as any,
      institution: userData.institution,
      fakultas: userData.fakultas,
      is_active: true,
      email_verified: true,
    })
    .select()
    .single()

  if (profileError) {
    // Rollback: delete auth user if profile creation fails
    await supabaseAdmin.auth.admin.deleteUser(authData.user!.id)
    throw profileError
  }

  return { auth: authData.user, profile: profileData }
}

/**
 * Delete user (bypass RLS)
 */
export async function deleteUser(userId: string) {
  // Delete user profile first
  const { error: profileError } = await supabaseAdmin.from('users').delete().eq('id', userId)

  if (profileError) {
    throw profileError
  }

  // Delete auth user
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (authError) {
    throw authError
  }

  return true
}

/**
 * Update user (bypass RLS)
 */
export async function updateUserAdmin(userId: string, updates: any) {
  const { data, error } = await supabaseAdmin.from('users').update(updates).eq('id', userId).select().single()

  if (error) {
    throw error
  }

  return data
}

/**
 * Get all users (bypass RLS)
 */
export async function getAllUsers() {
  const { data, error } = await supabaseAdmin.from('users').select('*').order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const { data, error } = await supabaseAdmin.from('users').select('*').eq('email', email).single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = not found
    throw error
  }

  return data
}

/**
 * Send email invitation to user
 */
export async function sendInvitationEmail(email: string) {
  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email)

  if (error) {
    throw error
  }

  return data
}

/**
 * Reset user password
 */
export async function resetUserPassword(userId: string, newPassword: string) {
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
  })

  if (error) {
    throw error
  }

  return data
}

// ============================================
// STORAGE ADMIN OPERATIONS
// ============================================

/**
 * List all files in bucket
 */
export async function listFiles(bucket: string, path?: string) {
  const { data, error } = await supabaseAdmin.storage.from(bucket).list(path)

  if (error) {
    throw error
  }

  return data
}

/**
 * Delete files (admin)
 */
export async function deleteFilesAdmin(bucket: string, paths: string[]) {
  const { data, error } = await supabaseAdmin.storage.from(bucket).remove(paths)

  if (error) {
    throw error
  }

  return data
}

/**
 * Move file
 */
export async function moveFile(bucket: string, fromPath: string, toPath: string) {
  const { data, error } = await supabaseAdmin.storage.from(bucket).move(fromPath, toPath)

  if (error) {
    throw error
  }

  return data
}

// ============================================
// DATABASE ADMIN OPERATIONS
// ============================================

/**
 * Execute raw SQL (use with caution!)
 */
export async function executeSQL(query: string) {
  const { data, error } = await supabaseAdmin.rpc('exec_sql', { query })

  if (error) {
    throw error
  }

  return data
}

export default supabaseAdmin
