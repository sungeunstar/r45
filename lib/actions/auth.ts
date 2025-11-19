'use server';

import { supabase, Church, User, ChurchUser } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

// 교회 등록 (새 교회 + 관리자 계정 생성)
export async function registerChurch(
  churchName: string,
  adminName: string,
  email: string,
  password: string
) {
  try {
    // 이메일 중복 확인
    const { data: existingUser } = await supabase
      .from('User')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return { success: false, error: '이미 사용 중인 이메일입니다.' };
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 10);

    // 교회 slug 생성 (교회명에서 특수문자 제거, 소문자)
    const slug = churchName
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);

    // 1. Church 생성
    const { data: church, error: churchError } = await supabase
      .from('Church')
      .insert({ name: churchName, slug })
      .select()
      .single();

    if (churchError || !church) {
      console.error('Church creation error:', churchError);
      return { success: false, error: '교회 등록에 실패했습니다.' };
    }

    // 2. User 생성
    const { data: user, error: userError } = await supabase
      .from('User')
      .insert({
        name: adminName,
        email,
        password: hashedPassword,
      })
      .select()
      .single();

    if (userError || !user) {
      // 롤백: Church 삭제
      await supabase.from('Church').delete().eq('id', church.id);
      console.error('User creation error:', userError);
      return { success: false, error: '사용자 등록에 실패했습니다.' };
    }

    // 3. ChurchUser 생성 (admin 역할)
    const { error: churchUserError } = await supabase
      .from('ChurchUser')
      .insert({
        church_id: church.id,
        user_id: user.id,
        role: 'admin',
      });

    if (churchUserError) {
      // 롤백: User, Church 삭제
      await supabase.from('User').delete().eq('id', user.id);
      await supabase.from('Church').delete().eq('id', church.id);
      console.error('ChurchUser creation error:', churchUserError);
      return { success: false, error: '관리자 연결에 실패했습니다.' };
    }

    // 세션 생성 (자동 로그인)
    const session = await getSession();
    session.userId = user.id;
    session.email = user.email;
    session.userName = user.name;
    session.churchId = church.id;
    session.churchName = church.name;
    session.churchSlug = church.slug || '';
    session.role = 'admin';
    session.isLoggedIn = true;
    await session.save();

    return { success: true, churchId: church.id };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: '등록 중 오류가 발생했습니다.' };
  }
}

// 로그인 (User + ChurchUser 기반)
export async function loginAdmin(email: string, password: string) {
  try {
    // 먼저 기존 AdminUser에서 조회 (마이그레이션 전 호환성)
    const { data: admin, error: adminError } = await supabase
      .from('AdminUser')
      .select('*')
      .eq('email', email)
      .single();

    if (admin && !adminError) {
      const isValid = await bcrypt.compare(password, admin.password);
      if (!isValid) {
        return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
      }

      // 기존 AdminUser용 세션 (기본 교회로 연결)
      const session = await getSession();
      session.userId = admin.id;
      session.email = admin.email;
      session.userName = admin.email.split('@')[0];
      session.churchId = '00000000-0000-0000-0000-000000000001'; // 기본 교회
      session.churchName = '기본 교회';
      session.churchSlug = 'default';
      session.role = 'admin';
      session.isLoggedIn = true;
      await session.save();

      return { success: true };
    }

    // AdminUser에 없으면 User 테이블에서 조회
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
    }

    // 비밀번호 확인
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
    }

    // ChurchUser에서 교회 정보 가져오기
    const { data: churchUser, error: churchUserError } = await supabase
      .from('ChurchUser')
      .select(`
        role,
        church:Church(id, name, slug)
      `)
      .eq('user_id', user.id)
      .single();

    if (churchUserError || !churchUser) {
      return { success: false, error: '교회 정보를 찾을 수 없습니다.' };
    }

    // 타입 단언
    const church = churchUser.church as unknown as Church;

    // 세션 생성
    const session = await getSession();
    session.userId = user.id;
    session.email = user.email;
    session.userName = user.name;
    session.churchId = church.id;
    session.churchName = church.name;
    session.churchSlug = church.slug || '';
    session.role = churchUser.role;
    session.isLoggedIn = true;
    await session.save();

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: '로그인 중 오류가 발생했습니다.' };
  }
}

export async function logoutAdmin() {
  const session = await getSession();
  session.destroy();
  redirect('/admin/login');
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return null;
  }
  return {
    userId: session.userId,
    email: session.email,
    userName: session.userName,
    churchId: session.churchId,
    churchName: session.churchName,
    churchSlug: session.churchSlug,
    role: session.role,
  };
}

// 교회 정보 조회 (slug로)
export async function getChurchBySlug(slug: string) {
  const { data, error } = await supabase
    .from('Church')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Church;
}

// 교회 정보 조회 (id로)
export async function getChurchById(id: string) {
  const { data, error } = await supabase
    .from('Church')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Church;
}
