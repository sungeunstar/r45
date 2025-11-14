'use server';

import { supabase } from '@/lib/supabase';
import { isAuthenticated } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createAdminUser(email: string, password: string) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { error } = await supabase
      .from('AdminUser')
      .insert({
        email,
        password: hashedPassword,
      });

    if (error) throw error;

    revalidatePath('/admin/admins');
    return { success: true };
  } catch (error) {
    console.error('Create admin error:', error);
    return { success: false, error: 'Failed to create admin' };
  }
}

export async function updateAdminPassword(id: string, newPassword: string) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const { error } = await supabase
      .from('AdminUser')
      .update({ password: hashedPassword })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/admins');
    return { success: true };
  } catch (error) {
    console.error('Update password error:', error);
    return { success: false, error: 'Failed to update password' };
  }
}

export async function deleteAdminUser(id: string) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  try {
    const { error } = await supabase
      .from('AdminUser')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/admins');
    return { success: true };
  } catch (error) {
    console.error('Delete admin error:', error);
    return { success: false, error: 'Failed to delete admin' };
  }
}

export async function getAllAdmins() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  const { data, error } = await supabase
    .from('AdminUser')
    .select('id, email, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Convert snake_case to camelCase
  return (data || []).map(admin => ({
    id: admin.id,
    email: admin.email,
    createdAt: admin.created_at,
  }));
}
