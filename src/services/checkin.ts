import dayjs from 'dayjs';
import type { CheckinRecord, CheckinType, LocationInfo, DayCheckinInfo, CheckinStats } from '@/types/checkin';

export const checkinService = {
  doCheckin: async (
    type: CheckinType,
    location: LocationInfo,
    remark?: string,
    photoUrl?: string
  ): Promise<CheckinRecord> => {
    console.log('[CheckinService] Do checkin:', type);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const now = dayjs();
    const workStartTime = dayjs().set('hour', 9).set('minute', 0);
    const workEndTime = dayjs().set('hour', 18).set('minute', 0);

    let status: CheckinRecord['status'] = 'success';
    if (type === 'clockIn') {
      const lateMinutes = now.diff(workStartTime, 'minute');
      if (lateMinutes > 0) {
        status = 'late';
      }
    } else if (type === 'clockOut') {
      const earlyMinutes = workEndTime.diff(now, 'minute');
      if (earlyMinutes > 0) {
        status = 'early';
      }
    } else if (type === 'outing') {
      status = 'outing';
    }

    const record: CheckinRecord = {
      id: `CK${Date.now()}`,
      userId: 'U001',
      date: now.format('YYYY-MM-DD'),
      type,
      status,
      time: now.format('HH:mm:ss'),
      location,
      remark,
      photoUrl,
      createdAt: now.toISOString(),
    };

    console.log('[CheckinService] Checkin result:', status);
    return record;
  },

  getTodayRecords: async (): Promise<CheckinRecord[]> => {
    console.log('[CheckinService] Get today records');
    await new Promise((resolve) => setTimeout(resolve, 300));

    const today = dayjs().format('YYYY-MM-DD');
    const mockRecords: CheckinRecord[] = [
      {
        id: 'CK001',
        userId: 'U001',
        date: today,
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
        createdAt: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      },
    ];

    return mockRecords;
  },

  getMonthRecords: async (year: number, month: number): Promise<DayCheckinInfo[]> => {
    console.log('[CheckinService] Get month records:', year, month);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const daysInMonth = dayjs(`${year}-${month}`).daysInMonth();
    const records: DayCheckinInfo[] = [];
    const statuses: DayCheckinInfo['status'][] = [
      'normal', 'normal', 'normal', 'late', 'normal',
      'normal', 'early', 'normal', 'normal', 'normal',
      'leave', 'normal', 'normal', 'outing', 'normal',
    ];

    for (let i = 1; i <= daysInMonth; i++) {
      const date = dayjs(`${year}-${month}-${i}`);
      const dayOfWeek = date.day();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      let status: DayCheckinInfo['status'] = isWeekend ? 'weekend' : statuses[i % statuses.length];

      const dayRecord: DayCheckinInfo = {
        date: date.format('YYYY-MM-DD'),
        status,
        workDuration: status !== 'weekend' && status !== 'leave' ? '8h30m' : undefined,
      };

      if (!isWeekend && status !== 'absent' && status !== 'leave') {
        dayRecord.clockIn = {
          id: `CK${i}in`,
          userId: 'U001',
          date: date.format('YYYY-MM-DD'),
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
          createdAt: date.toISOString(),
        };
        dayRecord.clockOut = {
          id: `CK${i}out`,
          userId: 'U001',
          date: date.format('YYYY-MM-DD'),
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
          createdAt: date.toISOString(),
        };
      }

      records.push(dayRecord);
    }

    return records;
  },

  getStats: async (year: number, month: number): Promise<CheckinStats> => {
    console.log('[CheckinService] Get stats:', year, month);
    await new Promise((resolve) => setTimeout(resolve, 400));

    const stats: CheckinStats = {
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

    return stats;
  },

  getConfig: async () => {
    console.log('[CheckinService] Get config');
    await new Promise((resolve) => setTimeout(resolve, 200));

    return {
      workStartTime: '09:00',
      workEndTime: '18:00',
      lateThreshold: 10,
      earlyThreshold: 10,
      allowedDistance: 200,
      allowedWifiList: ['Company-WiFi', 'Office-WiFi'],
    };
  },
};
