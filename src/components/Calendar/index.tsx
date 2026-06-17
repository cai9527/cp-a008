import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import dayjs from 'dayjs';
import styles from './index.module.scss';
import classnames from 'classnames';
import type { DayCheckinInfo } from '@/types/checkin';

interface CalendarProps {
  year: number;
  month: number;
  records: DayCheckinInfo[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

const statusDotColor: Record<string, string> = {
  normal: '#00B42A',
  late: '#FF7D00',
  early: '#FF7D00',
  absent: '#F53F3F',
  leave: '#1677FF',
  outing: '#722ED1',
  weekend: 'transparent',
};

const Calendar: React.FC<CalendarProps> = ({ year, month, records, selectedDate, onDateSelect }) => {
  const days = useMemo(() => {
    const firstDay = dayjs(`${year}-${month}-01`);
    const daysInMonth = firstDay.daysInMonth();
    const startDayOfWeek = firstDay.day();

    const result: Array<{
      date: string;
      day: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      record?: DayCheckinInfo;
      isWeekend: boolean;
    }> = [];

    const prevMonth = firstDay.subtract(1, 'month');
    const prevMonthDays = prevMonth.daysInMonth();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const date = prevMonth.date(day).format('YYYY-MM-DD');
      result.push({
        date,
        day,
        isCurrentMonth: false,
        isToday: false,
        isSelected: date === selectedDate,
        record: records.find((r) => r.date === date),
        isWeekend: prevMonth.date(day).day() === 0 || prevMonth.date(day).day() === 6,
      });
    }

    const today = dayjs().format('YYYY-MM-DD');
    for (let i = 1; i <= daysInMonth; i++) {
      const date = dayjs(`${year}-${month}-${i}`).format('YYYY-MM-DD');
      const dayOfWeek = dayjs(`${year}-${month}-${i}`).day();
      result.push({
        date,
        day: i,
        isCurrentMonth: true,
        isToday: date === today,
        isSelected: date === selectedDate,
        record: records.find((r) => r.date === date),
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }

    const remaining = 42 - result.length;
    const nextMonth = firstDay.add(1, 'month');
    for (let i = 1; i <= remaining; i++) {
      const date = nextMonth.date(i).format('YYYY-MM-DD');
      result.push({
        date,
        day: i,
        isCurrentMonth: false,
        isToday: false,
        isSelected: date === selectedDate,
        record: records.find((r) => r.date === date),
        isWeekend: nextMonth.date(i).day() === 0 || nextMonth.date(i).day() === 6,
      });
    }

    return result;
  }, [year, month, records, selectedDate]);

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <View className={styles.calendar}>
      <View className={styles.weekHeader}>
        {weekDays.map((day, index) => (
          <Text
            key={day}
            className={classnames(
              styles.weekDay,
              (index === 0 || index === 6) && styles.weekend
            )}
          >
            {day}
          </Text>
        ))}
      </View>
      <View className={styles.daysGrid}>
        {days.map((item) => (
          <View
            key={item.date}
            className={classnames(
              styles.dayCell,
              !item.isCurrentMonth && styles.otherMonth,
              item.isSelected && styles.selected,
              item.isToday && !item.isSelected && styles.today,
              item.isWeekend && item.isCurrentMonth && styles.weekendCell
            )}
            onClick={() => item.isCurrentMonth && onDateSelect(item.date)}
          >
            <Text
              className={classnames(
                styles.dayText,
                item.isSelected && styles.selectedText,
                item.isToday && !item.isSelected && styles.todayText
              )}
            >
              {item.day}
            </Text>
            {item.record && item.isCurrentMonth && item.record.status !== 'weekend' && (
              <View
                className={styles.statusDot}
                style={{ backgroundColor: statusDotColor[item.record.status] || 'transparent' }}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export default Calendar;
