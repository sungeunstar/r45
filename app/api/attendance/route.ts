import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
      .from('sessions')
      .select('id, name, status')
      .eq('public_token', sessionToken)
      .eq('is_deleted', false)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 세션입니다' },
        { status: 404 }
      );
    }

    // 세션 상태 체크
    if (session.status === 'closed') {
      return NextResponse.json(
        { success: false, error: '종료된 세션입니다' },
        { status: 400 }
      );
    }

    // 2. phone_last4로 멤버 자동 매칭 (함수 사용)
    const { data: matchResult } = await supabase.rpc('match_member_by_phone', {
      p_phone_last4: phoneLast4
    });

    const memberId = matchResult || null;

    // 3. 기존 출석 기록 확인
    const { data: existingAttendance } = await supabase
      .from('attendance')
      .select('*')
      .eq('session_id', session.id)
      .eq('phone_last4', phoneLast4)
      .eq('is_deleted', false)
      .single();

    // 4. UPSERT (있으면 UPDATE, 없으면 INSERT)
    const attendanceData = {
      session_id: session.id,
      phone_last4: phoneLast4,
      member_id: memberId,
      status,
      reason: reason || null,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      user_agent: request.headers.get('user-agent') || null,
    };

    if (existingAttendance) {
      // UPDATE
      const { data, error } = await supabase
        .from('attendance')
        .update({
          status,
          reason: reason || null,
          member_id: memberId, // 멤버 재매칭
          updated_at: new Date().toISOString(),
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

      return NextResponse.json({
        success: true,
        data,
        isUpdate: true,
        message: '출석 상태가 수정되었습니다',
      });
    } else {
      // INSERT
      const { data, error } = await supabase
        .from('attendance')
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
      .from('sessions')
      .select('id')
      .eq('public_token', sessionToken)
      .eq('is_deleted', false)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 세션입니다' },
        { status: 404 }
      );
    }

    // 출석 기록 조회
    const { data: attendance, error } = await supabase
      .from('attendance')
      .select('*, members(name, part)')
      .eq('session_id', session.id)
      .eq('phone_last4', phoneLast4)
      .eq('is_deleted', false)
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
