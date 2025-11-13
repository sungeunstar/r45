'use server';

import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createMember(name: string, phone: string, group: string) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  try {
    await prisma.member.create({
      data: { name, phone, group, isActive: true },
    });

    revalidatePath('/admin/members');
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
    await prisma.member.update({
      where: { id },
      data: { name, phone, group, isActive },
    });

    revalidatePath('/admin/members');
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
    await prisma.member.delete({
      where: { id },
    });

    revalidatePath('/admin/members');
    return { success: true };
  } catch (error) {
    console.error('Delete member error:', error);
    return { success: false, error: 'Failed to delete member' };
  }
}

export async function getAllMembers(groupFilter?: string) {
  return await prisma.member.findMany({
    where: groupFilter ? { group: groupFilter } : undefined,
    orderBy: [{ group: 'asc' }, { name: 'asc' }],
  });
}

export async function getMemberById(id: string) {
  return await prisma.member.findUnique({
    where: { id },
  });
}

export async function getActiveMembers() {
  return await prisma.member.findMany({
    where: { isActive: true },
    orderBy: [{ group: 'asc' }, { name: 'asc' }],
  });
}
