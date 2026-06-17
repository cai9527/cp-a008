import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CheckinRecord, DayCheckinInfo, CheckinStats } from '@/types/checkin';

interface CheckinStore {
  records: CheckinRecord[];
  todayRecords: CheckinRecord[];
  monthRecords: DayCheckinInfo[];
  stats: CheckinStats | null;
  setRecords: (records: CheckinRecord[]) => void;
  addRecord: (record: CheckinRecord) => void;
  setTodayRecords: (records: CheckinRecord[]) => void;
  setMonthRecords: (records: DayCheckinInfo[]) => void;
  setStats: (stats: CheckinStats) => void;
  reset: () => void;
}

const initialStats: CheckinStats = {
  totalDays: 0,
  presentDays: 0,
  lateDays: 0,
  earlyDays: 0,
  absentDays: 0,
  leaveDays: 0,
  outingDays: 0,
  attendanceRate: 0,
  avgWorkHours: '0h',
};

export const useCheckinStore = create<CheckinStore>()(
  persist(
    (set) => ({
      records: [],
      todayRecords: [],
      monthRecords: [],
      stats: null,
      setRecords: (records) => {
        console.log('[Checkin] Set records:', records.length);
        set({ records });
      },
      addRecord: (record) => {
        console.log('[Checkin] Add record:', record.type, record.time);
        set((state) => ({
          records: [record, ...state.records],
          todayRecords: [record, ...state.todayRecords],
        }));
      },
      setTodayRecords: (todayRecords) => set({ todayRecords }),
      setMonthRecords: (monthRecords) => set({ monthRecords }),
      setStats: (stats) => set({ stats }),
      reset: () =>
        set({
          records: [],
          todayRecords: [],
          monthRecords: [],
          stats: initialStats,
        }),
    }),
    {
      name: 'checkin-storage',
    }
  )
);
