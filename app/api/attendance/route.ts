import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { sessionToken, phoneLast4, status, reason } = await request.json();

    // 입력 검증
    if (!phoneLast4 || phoneLast4.length !== 4) {
      return NextResponse.json(
        { success: false, error: '핸드폰 번호 뒷자리 4자리를 입력해주세요' },
        { status: 400 }
      );
    }

    if (!status || !['attend', 'absent', 'late'].includes(status)) {
      return NextResponse.json(
        { success: false, error: '올바른 출석 상태를 선택해주세요' },
        { status: 400 }
      );
    }

    // 1. 세션 조회
    const { data: session, error: sessionError } = await supabase
      .from('Session')
      .select('id, name')
      .eq('public_token', sessionToken)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 세션입니다' },
        { status: 404 }
      );
    }

    // 2. phone_last4로 멤버 찾기 (자동 매칭)
    const { data: allMembers } = await supabase
      .from('Member')
      .select('*')
      .eq('is_active', true);

    // 전화번호 뒷자리로 멤버 매칭 (하이픈 제거 후 비교)
    let matchedMemberId: string | null = null;
    if (allMembers && allMembers.length > 0) {
      const matchedMembers = allMembers.filter((member: any) => {
        const cleanPhone = member.phone.replace(/-/g, ''); // 하이픈 제거
        return cleanPhone.slice(-4) === phoneLast4; // 뒷자리 4자리 비교
      });

      // 정확히 1명일 때만 자동 매칭
      if (matchedMembers.length === 1) {
        matchedMemberId = matchedMembers[0].id;
      }
    }

    // 3. 기존 출석 기록 확인
    const { data: existingAttendance } = await supabase
      .from('Attendance')
      .select('*')
      .eq('session_id', session.id)
      .eq('phone_last4', phoneLast4)
      .single();

    // 4. UPSERT (있으면 UPDATE, 없으면 INSERT)
    const attendanceData = {
      session_id: session.id,
      phone_last4: phoneLast4,
      member_id: matchedMemberId, // 자동 매칭된 멤버 ID
      status,
      reason: reason || null,
    };

    if (existingAttendance) {
      // UPDATE
      const { data, error } = await supabase
        .from('Attendance')
        .update({
          member_id: matchedMemberId, // 멤버 ID도 업데이트
          status,
          reason: reason || null,
        })
        .eq('id', existingAttendance.id)
        .select()
        .single();

      if (error) {
        console.error('Attendance update error:', error);
        return NextResponse.json(
          { success: false, error: '출석 상태 업데이트에 실패했습니다' },
          { status: 500 }
        );
      }

      // Invalidate caches
      revalidateTag('sessions');
      revalidateTag(`session-${session.id}-attendance`);

      return NextResponse.json({
        success: true,
        data,
        isUpdate: true,
        message: '출석 상태가 수정되었습니다',
      });
    } else {
      // INSERT
      const { data, error } = await supabase
        .from('Attendance')
        .insert(attendanceData)
        .select()
        .single();

      if (error) {
        console.error('Attendance insert error:', error);
        return NextResponse.json(
          { success: false, error: '출석 체크에 실패했습니다' },
          { status: 500 }
        );
      }

      // Invalidate caches
      revalidateTag('sessions');
      revalidateTag(`session-${session.id}-attendance`);

      return NextResponse.json({
        success: true,
        data,
        isUpdate: false,
        message: '출석이 기록되었습니다',
      });
    }
  } catch (error) {
    console.error('Attendance API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// 기존 출석 기록 조회 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionToken = searchParams.get('sessionToken');
    const phoneLast4 = searchParams.get('phoneLast4');

    if (!sessionToken || !phoneLast4) {
      return NextResponse.json(
        { success: false, error: '필수 파라미터가 누락되었습니다' },
        { status: 400 }
      );
    }

    // 세션 조회
    const { data: session, error: sessionError } = await supabase
      .from('Session')
      .select('id')
      .eq('public_token', sessionToken)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 세션입니다' },
        { status: 404 }
      );
    }

    // 출석 기록 조회
    const { data: attendance, error } = await supabase
      .from('Attendance')
      .select('*')
      .eq('session_id', session.id)
      .eq('phone_last4', phoneLast4)
      .single();

    if (error || !attendance) {
      return NextResponse.json({
        success: true,
        exists: false,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      exists: true,
      data: attendance,
    });
  } catch (error) {
    console.error('Attendance GET error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
