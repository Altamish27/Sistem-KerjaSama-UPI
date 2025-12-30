import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper untuk upload dokumen
export async function uploadDocument(
  file: File,
  proposalId: string,
  userId: string
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${proposalId}/${userId}-${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('proposal-documents')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('proposal-documents')
    .getPublicUrl(data.path);

  return publicUrl;
}

// Helper untuk download dokumen
export async function downloadDocument(path: string): Promise<Blob> {
  const { data, error } = await supabase.storage
    .from('proposal-documents')
    .download(path);

  if (error) {
    throw error;
  }

  return data;
}

// Helper untuk delete dokumen
export async function deleteDocument(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from('proposal-documents')
    .remove([path]);

  if (error) {
    throw error;
  }
}
