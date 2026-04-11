/**
 * Script untuk create initial users di Supabase
 * Membuat Auth user DAN menyinkronkan dengan database users.
 * Run: npx tsx scripts/create-users.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import type { UserRole } from '../lib/supabase/database.types'

interface UserSeed {
  email: string
  password: string
  name: string
  role: UserRole
  kode_unit: string | null // Lookup key untuk unit_kerja, bukan UUID langsung
  institution?: string
}

const INITIAL_USERS: UserSeed[] = [
  {
    email: 'admin.dkui@upi.edu',
    password: 'Admin123!',
    name: 'admin.dkui',
    role: 'dkui',
    kode_unit: 'DKUI'
  },
  {
    email: 'operator.fpmipa@upi.edu',
    password: 'Admin123!',
    name: 'operator.fpmipa',
    role: 'operator_unit',
    kode_unit: 'FPMIPA'
  },
  {
    email: 'dekan.fpmipa@upi.edu',
    password: 'Admin123!',
    name: 'dekan.fpmipa',
    role: 'pimpinan_unit',
    kode_unit: 'FPMIPA'
  },
  {
    email: 'dekan.fip@upi.edu',
    password: 'Admin123!',
    name: 'dekan.fip',
    role: 'pimpinan_unit',
    kode_unit: 'FIP'
  },
  {
    email: 'legal@upi.edu',
    password: 'Admin123!',
    name: 'legal',
    role: 'biro_hukum',
    kode_unit: 'KHO'
  },
  {
    email: 'sekretaris@upi.edu',
    password: 'Admin123!',
    name: 'sekretaris',
    role: 'sekretaris_universitas',
    kode_unit: 'SU'
  },
  {
    email: 'warek.ruk@upi.edu',
    password: 'Admin123!',
    name: 'warek.ruk',
    role: 'wakil_rektor',
    kode_unit: null
  },
  {
    email: 'rektor@upi.edu',
    password: 'Admin123!',
    name: 'rektor',
    role: 'rektor',
    kode_unit: null
  },
  {
    email: 'mitra@example.com',
    password: 'Mitra123!',
    name: 'mitra',
    role: 'mitra',
    kode_unit: null,
    institution: 'PT Mitra Sejahtera'
  }
]

async function createUsers() {
  // Dynamic import agar dotenv sudah loaded sebelum admin.ts dieksekusi
  const { supabaseAdmin } = await import('../lib/supabase/admin')

  console.log('🚀 Starting user creation...\n')

  for (const userData of INITIAL_USERS) {
    try {
      console.log(`Processing user: ${userData.email}`)

      // 1. Resolve unit_id dari kode_unit jika ada
      let unitId: string | null = null
      if (userData.kode_unit) {
        const { data: unit } = await supabaseAdmin
          .from('unit_kerja')
          .select('id')
          .eq('kode_unit', userData.kode_unit)
          .single()

        if (unit) {
          unitId = unit.id
          console.log(`   Unit ${userData.kode_unit} → ${unitId}`)
        } else {
          console.warn(`   ⚠️ Unit ${userData.kode_unit} not found, setting unit_id to null`)
        }
      }

      // 2. Check apakah auth user sudah ada
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
      const existingAuth = existingUsers?.users?.find(u => u.email === userData.email)

      let authUserId: string

      if (existingAuth) {
        console.log(`   Auth user already exists: ${existingAuth.id}`)
        authUserId = existingAuth.id
      } else {
        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: {
            name: userData.name,
            role: userData.role,
          }
        })

        if (authError) {
          console.error(`   ❌ Error creating auth user: ${authError.message}`)
          continue
        }

        authUserId = authData.user.id
        console.log(`   ✅ Auth user created: ${authUserId}`)
      }

      // 3. Upsert database record (update jika sudah ada berdasarkan email)
      const { data: existingDbUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .single()

      if (existingDbUser) {
        // Update existing DB user — sync ID with auth user
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({
            id: authUserId,
            name: userData.name,
            role: userData.role,
            unit_id: unitId,
          })
          .eq('email', userData.email)

        if (updateError) {
          console.error(`   ❌ Error updating database user: ${updateError.message}`)
          continue
        }
        console.log(`   ✅ Database record updated (synced auth ID)`)
      } else {
        // Insert new DB user
        const { error: dbError } = await supabaseAdmin
          .from('users')
          .insert({
            id: authUserId,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            unit_id: unitId,
            ...(userData.institution ? { institution: userData.institution } : {}),
          })

        if (dbError) {
          console.error(`   ❌ Error creating database user: ${dbError.message}`)
          continue
        }
        console.log(`   ✅ Database record created`)
      }

      console.log(`   📧 ${userData.email} / ${userData.password} (${userData.role})\n`)

    } catch (error) {
      console.error(`❌ Unexpected error:`, error)
    }
  }

  console.log('\n✨ User creation complete!')
  console.log('\n📝 Login credentials:')
  INITIAL_USERS.forEach(u => {
    console.log(`   ${u.role.toUpperCase()}: ${u.email} / ${u.password}`)
  })
}

// Run the script
createUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
