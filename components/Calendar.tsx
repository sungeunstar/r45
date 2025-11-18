'use client';

import { useState } from 'react';
import { Session } from '@/lib/supabase';

interface CalendarProps {
  sessions: (Session & { attendanceCount?: number; presentCount?: number; absentCount?: number })[];
  onSessionClick?: (session: Session) => void;
  onDateClick?: (date: Date) => void;
}

export default function Calendar({ sessions, onSessionClick, onDateClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 월의 첫 번째 날과 마지막 날
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // 달력에 표시할 시작 요일과 총 일수
  const startDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  // 이전 달의 마지막 날짜들
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  // 날짜별 일정 그룹화
  const sessionsByDate = new Map<string, typeof sessions>();
  sessions.forEach(session => {
    const dateKey = new Date(session.date).toDateString();
    const existing = sessionsByDate.get(dateKey) || [];
    existing.push(session);
    sessionsByDate.set(dateKey, existing);
  });

  // 달력 셀 생성
  const calendarCells = [];

  // 이전 달 날짜
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    calendarCells.push({
      day: prevMonthLastDay - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevMonthLastDay - i),
    });
  }

  // 현재 달 날짜
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push({
      day,
      isCurrentMonth: true,
      date: new Date(year, month, day),
    });
  }

  // 다음 달 날짜 (6주 = 42칸 채우기)
  const remainingCells = 42 - calendarCells.length;
  for (let day = 1; day <= remainingCells; day++) {
    calendarCells.push({
      day,
      isCurrentMonth: false,
      date: new Date(year, month + 1, day),
    });
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.06)',
        borderRadius: '18px',
        padding: '20px',
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <button
          onClick={prevMonth}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#FFFFFF',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          &lt;
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#FFFFFF',
              margin: 0,
            }}
          >
            {year}년 {monthNames[month]}
          </h2>
          <button
            onClick={goToToday}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 8px',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            오늘
          </button>
        </div>
        <button
          onClick={nextMonth}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#FFFFFF',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          &gt;
        </button>
      </div>

      {/* 요일 헤더 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          marginBottom: '8px',
        }}
      >
        {dayNames.map((day, index) => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: '500',
              color: index === 0 ? 'rgba(255, 100, 100, 0.8)' : 'rgba(255, 255, 255, 0.5)',
              padding: '8px 0',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '2px',
        }}
      >
        {calendarCells.map((cell, index) => {
          const dateKey = cell.date.toDateString();
          const daySessions = sessionsByDate.get(dateKey) || [];
          const isSunday = cell.date.getDay() === 0;

          return (
            <div
              key={index}
              onClick={() => {
                if (onDateClick && cell.isCurrentMonth) {
                  onDateClick(cell.date);
                }
              }}
              style={{
                minHeight: '80px',
                padding: '4px',
                background: isToday(cell.date)
                  ? 'rgba(100, 150, 255, 0.2)'
                  : cell.isCurrentMonth
                  ? 'rgba(255, 255, 255, 0.03)'
                  : 'transparent',
                borderRadius: '8px',
                cursor: cell.isCurrentMonth && onDateClick ? 'pointer' : 'default',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: isToday(cell.date) ? 'bold' : 'normal',
                  color: !cell.isCurrentMonth
                    ? 'rgba(255, 255, 255, 0.3)'
                    : isSunday
                    ? 'rgba(255, 100, 100, 0.8)'
                    : isToday(cell.date)
                    ? '#FFFFFF'
                    : 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '4px',
                }}
              >
                {cell.day}
              </div>
              {daySessions.slice(0, 2).map((session) => (
                <div
                  key={session.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSessionClick) {
                      onSessionClick(session);
                    }
                  }}
                  style={{
                    fontSize: '10px',
                    padding: '2px 4px',
                    background: 'rgba(100, 150, 255, 0.3)',
                    borderRadius: '4px',
                    marginBottom: '2px',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={session.title || session.name}
                >
                  {session.title || session.name}
                </div>
              ))}
              {daySessions.length > 2 && (
                <div
                  style={{
                    fontSize: '9px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    textAlign: 'center',
                  }}
                >
                  +{daySessions.length - 2}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
