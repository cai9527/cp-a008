export type CheckinType = 'clockIn' | 'clockOut' | 'outing';

export type CheckinStatus = 'success' | 'late' | 'early' | 'absent' | 'outing';

export interface LocationInfo {
  latitude: number;
  longitude: number;
  address: string;
  accuracy: number;
  wifiName?: string;
  wifiBssid?: string;
}

export interface CheckinRecord {
  id: string;
  userId: string;
  date: string;
  type: CheckinType;
  status: CheckinStatus;
  time: string;
  location: LocationInfo;
  remark?: string;
  photoUrl?: string;
  createdAt: string;
}

export interface DayCheckinInfo {
  date: string;
  clockIn?: CheckinRecord;
  clockOut?: CheckinRecord;
  status: 'normal' | 'late' | 'early' | 'absent' | 'leave' | 'outing' | 'weekend';
  workDuration?: string;
}

export interface CheckinStats {
  totalDays: number;
  presentDays: number;
  lateDays: number;
  earlyDays: number;
  absentDays: number;
  leaveDays: number;
  outingDays: number;
  attendanceRate: number;
  avgWorkHours: string;
}

export interface CheckinConfig {
  workStartTime: string;
  workEndTime: string;
  lateThreshold: number;
  earlyThreshold: number;
  allowedDistance: number;
  allowedWifiList: string[];
}
