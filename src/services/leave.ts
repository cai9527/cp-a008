import dayjs from 'dayjs';
import type { LeaveRecord, LeaveApplyParams, LeaveType } from '@/types/leave';

export const leaveService = {
  apply: async (params: LeaveApplyParams): Promise<LeaveRecord> => {
    console.log('[LeaveService] Apply leave:', params.type);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (!params.reason || params.reason.length < 5) {
      throw new Error('请详细填写请假原因（至少5个字）');
    }

    const typeNames: Record<LeaveType, string> = {
      annual: '年假',
      sick: '病假',
      personal: '事假',
      marriage: '婚假',
      maternity: '产假',
      paternity: '陪产假',
      other: '其他',
    };

    const startDate = dayjs(`${params.startDate} ${params.startTime}`);
    const endDate = dayjs(`${params.endDate} ${params.endTime}`);
    const days = endDate.diff(startDate, 'day') + 1;

    const record: LeaveRecord = {
      id: `LV${Date.now()}`,
      userId: 'U001',
      type: params.type,
      typeName: typeNames[params.type],
      startDate: params.startDate,
      endDate: params.endDate,
      startTime: params.startTime,
      endTime: params.endTime,
      days,
      reason: params.reason,
      attachmentUrl: params.attachmentUrl,
      status: 'pending',
      createdAt: dayjs().toISOString(),
    };

    console.log('[LeaveService] Leave application submitted');
    return record;
  },

  getRecords: async (status?: string): Promise<LeaveRecord[]> => {
    console.log('[LeaveService] Get records, status:', status);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockRecords: LeaveRecord[] = [
      {
        id: 'LV001',
        userId: 'U001',
        type: 'annual',
        typeName: '年假',
        startDate: '2024-06-15',
        endDate: '2024-06-16',
        startTime: '09:00',
        endTime: '18:00',
        days: 2,
        reason: '家中有事需要处理',
        status: 'approved',
        approver: '李经理',
        approvalRemark: '同意',
        createdAt: '2024-06-10T10:00:00Z',
      },
      {
        id: 'LV002',
        userId: 'U001',
        type: 'sick',
        typeName: '病假',
        startDate: '2024-05-20',
        endDate: '2024-05-20',
        startTime: '09:00',
        endTime: '18:00',
        days: 1,
        reason: '身体不适需要去医院检查',
        status: 'approved',
        approver: '李经理',
        approvalRemark: '注意休息',
        createdAt: '2024-05-19T18:30:00Z',
      },
      {
        id: 'LV003',
        userId: 'U001',
        type: 'personal',
        typeName: '事假',
        startDate: '2024-06-25',
        endDate: '2024-06-25',
        startTime: '14:00',
        endTime: '18:00',
        days: 0.5,
        reason: '下午需要参加家长会',
        status: 'pending',
        createdAt: '2024-06-20T09:00:00Z',
      },
    ];

    if (status && status !== 'all') {
      return mockRecords.filter((r) => r.status === status);
    }
    return mockRecords;
  },

  getDetail: async (id: string): Promise<LeaveRecord | null> => {
    console.log('[LeaveService] Get detail:', id);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const mockRecords: LeaveRecord[] = [
      {
        id: 'LV001',
        userId: 'U001',
        type: 'annual',
        typeName: '年假',
        startDate: '2024-06-15',
        endDate: '2024-06-16',
        startTime: '09:00',
        endTime: '18:00',
        days: 2,
        reason: '家中有事需要处理',
        status: 'approved',
        approver: '李经理',
        approvalRemark: '同意',
        createdAt: '2024-06-10T10:00:00Z',
      },
    ];

    return mockRecords.find((r) => r.id === id) || null;
  },

  cancel: async (id: string): Promise<void> => {
    console.log('[LeaveService] Cancel leave:', id);
    await new Promise((resolve) => setTimeout(resolve, 500));
  },

  getBalance: async () => {
    console.log('[LeaveService] Get balance');
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      annual: 10,
      sick: 5,
      personal: 3,
      marriage: 10,
      maternity: 158,
      paternity: 15,
      other: 0,
    };
  },
};
