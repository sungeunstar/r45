import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { phoneLast4 } = await request.json();

    if (!phoneLast4 || phoneLast4.length !== 4) {
      return NextResponse.json(
        { valid: false, error: '핸드폰 번호 뒷자리 4자리를 입력해주세요' },
        { status: 400 }
      );
    }

    // 모든 활성 멤버 조회
    const { data: allMembers } = await supabase
      .from('Member')
      .select('id, phone')
      .eq('is_active', true);

    if (!allMembers || allMembers.length === 0) {
      return NextResponse.json({
        valid: false,
        error: '등록되지 않은 번호입니다',
      });
    }

    // 전화번호 뒷자리로 매칭 확인
    const matchedMembers = allMembers.filter((member: any) => {
      const cleanPhone = member.phone.replace(/-/g, '');
      return cleanPhone.slice(-4) === phoneLast4;
    });

    if (matchedMembers.length === 0) {
      return NextResponse.json({
        valid: false,
        error: '등록되지 않은 번호입니다',
      });
    }

    // 매칭된 멤버가 있으면 유효
    return NextResponse.json({
      valid: true,
      matchCount: matchedMembers.length,
    });
  } catch (error) {
    console.error('Phone validation error:', error);
    return NextResponse.json(
      { valid: false, error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
