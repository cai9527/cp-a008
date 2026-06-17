import type { CheckinRecord, DayCheckinInfo, CheckinStats } from '@/types/checkin';

export const mockTodayRecords: CheckinRecord[] = [
  {
    id: 'CK001',
    userId: 'U001',
    date: '2024-06-16',
    type: 'clockIn',
    status: 'success',
    time: '08:55:30',
    location: {
      latitude: 39.9042,
      longitude: 116.4074,
      address: '北京市朝阳区建国路88号SOHO现代城',
      accuracy: 12,
      wifiName: 'Company-WiFi',
    },
    createdAt: '2024-06-16T08:55:30Z',
  },
];

export const mockMonthRecords: DayCheckinInfo[] = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const dayOfWeek = (day + 5) % 7;
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const statuses: DayCheckinInfo['status'][] = ['normal', 'normal', 'late', 'normal', 'early'];
  const status = isWeekend ? 'weekend' : statuses[day % statuses.length];

  const baseRecord: DayCheckinInfo = {
    date: `2024-06-${day.toString().padStart(2, '0')}`,
    status,
    workDuration: !isWeekend && status !== 'leave' && status !== 'absent' ? '8h30m' : undefined,
  };

  if (!isWeekend && status !== 'absent' && status !== 'leave') {
    baseRecord.clockIn = {
      id: `CK${day}in`,
      userId: 'U001',
      date: `2024-06-${day.toString().padStart(2, '0')}`,
      type: 'clockIn',
      status: status === 'late' ? 'late' : 'success',
      time: status === 'late' ? '09:15:00' : '08:50:00',
      location: {
        latitude: 39.9042,
        longitude: 116.4074,
        address: '北京市朝阳区建国路88号SOHO现代城',
        accuracy: 10,
        wifiName: 'Company-WiFi',
      },
      createdAt: `2024-06-${day.toString().padStart(2, '0')}T08:50:00Z`,
    };
    baseRecord.clockOut = {
      id: `CK${day}out`,
      userId: 'U001',
      date: `2024-06-${day.toString().padStart(2, '0')}`,
      type: 'clockOut',
      status: status === 'early' ? 'early' : 'success',
      time: status === 'early' ? '17:30:00' : '18:30:00',
      location: {
        latitude: 39.9042,
        longitude: 116.4074,
        address: '北京市朝阳区建国路88号SOHO现代城',
        accuracy: 10,
        wifiName: 'Company-WiFi',
      },
      createdAt: `2024-06-${day.toString().padStart(2, '0')}T18:30:00Z`,
    };
  }

  return baseRecord;
});

export const mockStats: CheckinStats = {
  totalDays: 22,
  presentDays: 19,
  lateDays: 2,
  earlyDays: 1,
  absentDays: 0,
  leaveDays: 1,
  outingDays: 1,
  attendanceRate: 90.9,
  avgWorkHours: '8h25m',
};

export const statusTextMap: Record<string, string> = {
  success: '正常',
  late: '迟到',
  early: '早退',
  absent: '缺勤',
  outing: '外勤',
  normal: '正常',
  leave: '请假',
  weekend: '周末',
};

export const statusColorMap: Record<string, string> = {
  success: '#00B42A',
  late: '#FF7D00',
  early: '#FF7D00',
  absent: '#F53F3F',
  outing: '#722ED1',
  normal: '#00B42A',
  leave: '#1677FF',
  weekend: '#C9CDD4',
};
