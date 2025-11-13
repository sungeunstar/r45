'use server';

import { prisma } from '@/lib/prisma';
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
    await prisma.adminUser.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

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
    await prisma.adminUser.update({
      where: { id },
      data: { password: hashedPassword },
    });

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
    await prisma.adminUser.delete({
      where: { id },
    });

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

  return await prisma.adminUser.findMany({
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}
