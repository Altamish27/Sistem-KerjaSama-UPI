/**
 * Script untuk create initial users di Supabase
 * Run dengan: node --loader ts-node/esm scripts/create-users.ts
 * atau: npx tsx scripts/create-users.ts
 */

import { supabaseAdmin } from '../lib/supabase/admin'

const INITIAL_USERS = [
  {
    email: 'admin.dkui@upi.edu',
    password: 'Admin123!',
    name: 'Dr. Bambang Suharto',
    role: 'dkui',
    unit: 'DKUI'
  },
  {
    email: 'dekan.fpmipa@upi.edu',
    password: 'Admin123!',
    name: 'Prof. Dr. Ari Widodo',
    role: 'faculty_dean',
    unit: 'FPMIPA'
  },
  {
    email: 'legal@upi.edu',
    password: 'Admin123!',
    name: 'Dra. Siti Nurjanah',
    role: 'legal',
    unit: 'Biro Hukum'
  },
  {
    email: 'mitra@example.com',
    password: 'Mitra123!',
    name: 'PT Mitra Sejahtera',
    role: 'partner',
    unit: null
  }
]

async function createUsers() {
  console.log('🚀 Starting user creation...\n')

  for (const userData of INITIAL_USERS) {
    try {
      console.log(`Creating user: ${userData.email}`)

      // 1. Create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name: userData.name,
          role: userData.role,
        }
      })

      if (authError) {
        console.error(`❌ Error creating auth user: ${authError.message}`)
        continue
      }

      console.log(`✅ Auth user created with ID: ${authData.user.id}`)

      // 2. Create user record in database
      const { error: dbError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authData.user.id, // Use same ID from auth
          email: userData.email,
          name: userData.name,
          role: userData.role,
          unit: userData.unit,
        })

      if (dbError) {
        console.error(`❌ Error creating database user: ${dbError.message}`)
        // Rollback auth user jika database insert gagal
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        console.log(`🔄 Rolled back auth user`)
        continue
      }

      console.log(`✅ Database record created`)
      console.log(`   Email: ${userData.email}`)
      console.log(`   Password: ${userData.password}`)
      console.log(`   Role: ${userData.role}\n`)

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
