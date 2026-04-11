/**
 * Script untuk RESET (hapus) SEMUA proposal beserta data terkait:
 *   - approval_history  (ON DELETE CASCADE)
 *   - documents          (ON DELETE CASCADE)
 *   - notifications      (ON DELETE CASCADE)
 *   - file di storage bucket "proposal-documents"
 *
 * SETUP (sekali saja):
 *   Jalankan SQL berikut di Supabase SQL Editor:
 *
 *   CREATE OR REPLACE FUNCTION reset_all_proposals()
 *   RETURNS void AS $$
 *   BEGIN
 *     ALTER TABLE proposals DISABLE TRIGGER cleanup_proposal_documents_trigger;
 *     DELETE FROM approval_history;
 *     DELETE FROM documents;
 *     DELETE FROM proposals;
 *     ALTER TABLE proposals ENABLE TRIGGER cleanup_proposal_documents_trigger;
 *   END;
 *   $$ LANGUAGE plpgsql SECURITY DEFINER;
 *
 * Run:  npx tsx scripts/reset-proposals.ts
 * Atau: npx tsx scripts/reset-proposals.ts --yes   (skip konfirmasi)
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import * as readline from 'readline'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Helpers ──────────────────────────────────────────────

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

async function countTable(table: string): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true })
  if (error) return -1
  return count ?? 0
}

async function ensureRpcFunction(): Promise<boolean> {
  // Try calling the function — if it exists, it'll work (or at least not 404)
  const { error } = await supabase.rpc('reset_all_proposals')
  if (!error) return true // it already ran successfully

  if (error.message.includes('Could not find the function')) {
    console.log('  ⚠ Function reset_all_proposals() belum ada di database.')
    console.log('  → Otomatis membuat function...')

    // Create the function via Supabase Management API (SQL endpoint)
    const sqlBody = `
      CREATE OR REPLACE FUNCTION reset_all_proposals()
      RETURNS void AS $$
      BEGIN
        ALTER TABLE proposals DISABLE TRIGGER cleanup_proposal_documents_trigger;
        DELETE FROM approval_history;
        DELETE FROM documents;
        DELETE FROM proposals;
        ALTER TABLE proposals ENABLE TRIGGER cleanup_proposal_documents_trigger;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `

    // Use the Supabase SQL endpoint (available with service role key)
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
    })

    // The management SQL API isn't available via PostgREST, so guide user
    console.log()
    console.log('  ❌ Tidak bisa auto-create function via PostgREST.')
    console.log('  💡 Jalankan SQL berikut di Supabase SQL Editor (sekali saja):')
    console.log()
    console.log('  ┌────────────────────────────────────────────────────────────────┐')
    console.log('  │ DROP TRIGGER IF EXISTS cleanup_proposal_documents_trigger    │')
    console.log('  │   ON proposals;                                              │')
    console.log('  │ DROP FUNCTION IF EXISTS cleanup_proposal_documents();        │')
    console.log('  │                                                              │')
    console.log('  │ CREATE OR REPLACE FUNCTION reset_all_proposals()             │')
    console.log('  │ RETURNS void AS $$                                           │')
    console.log('  │ BEGIN                                                        │')
    console.log('  │   DELETE FROM approval_history WHERE id IS NOT NULL;         │')
    console.log('  │   DELETE FROM documents WHERE id IS NOT NULL;                │')
    console.log('  │   DELETE FROM proposals WHERE id IS NOT NULL;                │')
    console.log('  │ END;                                                         │')
    console.log('  │ $$ LANGUAGE plpgsql SECURITY DEFINER;                        │')
    console.log('  └────────────────────────────────────────────────────────────────┘')
    console.log()
    console.log('  Setelah itu, jalankan script ini lagi.')
    return false
  }

  // Other unexpected error
  console.error('  ❌ Error calling reset_all_proposals:', error.message)
  return false
}

// ── Main ─────────────────────────────────────────────────

async function main() {
  const skipConfirm = process.argv.includes('--yes') || process.argv.includes('-y')

  console.log('╔══════════════════════════════════════╗')
  console.log('║   RESET PROPOSALS — Sistem Simkerma  ║')
  console.log('╚══════════════════════════════════════╝')
  console.log()

  // Show current counts
  const proposalCount = await countTable('proposals')
  const historyCount = await countTable('approval_history')
  const documentCount = await countTable('documents')

  console.log(`  📄 Proposals       : ${proposalCount}`)
  console.log(`  📋 Approval History: ${historyCount}`)
  console.log(`  📎 Documents       : ${documentCount}`)
  console.log()

  if (proposalCount === 0) {
    console.log('✅ Tidak ada data proposal. Tidak perlu reset.')
    process.exit(0)
  }

  // Confirm
  if (!skipConfirm) {
    const answer = await ask('⚠️  SEMUA data di atas akan DIHAPUS PERMANEN. Lanjutkan? (ketik "ya"): ')
    if (answer.toLowerCase() !== 'ya') {
      console.log('❌ Dibatalkan.')
      process.exit(0)
    }
  }

  console.log()
  console.log('🗑  Menghapus data...')

  // 1. Clean storage files via Storage API
  console.log('  → Membersihkan file storage...')
  for (const bucket of ['proposal-documents', 'penjajakan-documents']) {
    try {
      const allPaths = await collectStoragePaths(bucket, '')
      if (allPaths.length > 0) {
        for (let i = 0; i < allPaths.length; i += 100) {
          const batch = allPaths.slice(i, i + 100)
          await supabase.storage.from(bucket).remove(batch)
        }
        console.log(`    ✓ ${allPaths.length} file dihapus dari "${bucket}"`)
      } else {
        console.log(`    ✓ Bucket "${bucket}" sudah kosong`)
      }
    } catch {
      console.log(`    ⚠ Skip bucket "${bucket}"`)
    }
  }

  // 2. Delete proposals via RPC (handles trigger disable/enable)
  console.log('  → Menghapus proposals via RPC...')
  const ok = await ensureRpcFunction()
  if (!ok) process.exit(1)

  // 3. Verify
  const afterCount = await countTable('proposals')
  const afterHistory = await countTable('approval_history')
  const afterDocs = await countTable('documents')

  console.log()
  console.log('✅ Reset selesai!')
  console.log(`  📄 Proposals       : ${proposalCount} → ${afterCount}`)
  console.log(`  📋 Approval History: ${historyCount} → ${afterHistory}`)
  console.log(`  📎 Documents       : ${documentCount} → ${afterDocs}`)
}

async function collectStoragePaths(bucket: string, prefix: string): Promise<string[]> {
  const paths: string[] = []
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(prefix, { limit: 10000 })

  if (error || !data) return paths

  for (const item of data) {
    const fullPath = prefix ? `${prefix}/${item.name}` : item.name
    if (item.id === null) {
      const subPaths = await collectStoragePaths(bucket, fullPath)
      paths.push(...subPaths)
    } else {
      paths.push(fullPath)
    }
  }

  return paths
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err)
  process.exit(1)
})
