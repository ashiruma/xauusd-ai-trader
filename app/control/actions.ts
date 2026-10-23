'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

const STATUSES = ['pending', 'approved', 'rejected'];

export async function setStatus(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '');
  if (!id || !STATUSES.includes(status)) return;
  const supabase = await createClient();
  await supabase.rpc('admin_set_status', { target: id, new_status: status });
  revalidatePath('/control');
}
