import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { sessionToken, phoneLast4, status, reason } = await request.json();

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

    // Attendance 테이블에 삽입
    const { data, error } = await supabase
      .from('Attendance')
      .insert({
        session_id: session.id,
        phone_last4: phoneLast4,
        status,
        reason: reason || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Attendance insert error:', error);
      return NextResponse.json(
        { success: false, error: '출석 체크에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Attendance API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
