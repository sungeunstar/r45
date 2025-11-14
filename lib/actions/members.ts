'use server';

import { supabase } from '@/lib/supabase';
import { isAuthenticated } from '@/lib/auth';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createMember(name: string, phone: string, group: string) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  try {
    const { error } = await supabase
      .from('Member')
      .insert({ name, phone, group, is_active: true });

    if (error) throw error;

    revalidatePath('/admin/members');
    revalidateTag('members');
    return { success: true };
  } catch (error) {
    console.error('Create member error:', error);
    return { success: false, error: 'Failed to create member' };
  }
}

export async function updateMember(id: string, name: string, phone: string, group: string, isActive: boolean) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  try {
    const { error } = await supabase
      .from('Member')
      .update({ name, phone, group, is_active: isActive })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/members');
    revalidateTag('members');
    return { success: true };
  } catch (error) {
    console.error('Update member error:', error);
    return { success: false, error: 'Failed to update member' };
  }
}

export async function deleteMember(id: string) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  try {
    const { error } = await supabase
      .from('Member')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/members');
    revalidateTag('members');
    return { success: true };
  } catch (error) {
    console.error('Delete member error:', error);
    return { success: false, error: 'Failed to delete member' };
  }
}

// Cached data fetching (no dynamic data sources)
const getAllMembersCached = (groupFilter?: string) =>
  unstable_cache(
    async () => {
      let query = supabase
        .from('Member')
        .select('*')
        .order('group', { ascending: true })
        .order('name', { ascending: true });

      if (groupFilter) {
        query = query.eq('group', groupFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    ['members', groupFilter || 'all'],
    { revalidate: 60, tags: ['members'] }
  )();

// Public export - can be called without auth for some use cases
export async function getAllMembers(groupFilter?: string) {
  return getAllMembersCached(groupFilter);
}

export async function getMemberById(id: string) {
  const { data, error } = await supabase
    .from('Member')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getActiveMembers() {
  const { data, error } = await supabase
    .from('Member')
    .select('*')
    .eq('is_active', true)
    .order('group', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}
