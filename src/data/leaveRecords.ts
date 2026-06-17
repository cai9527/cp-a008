import type { LeaveRecord } from '@/types/leave';

export const mockLeaveRecords: LeaveRecord[] = [
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
    reason: '家中有事需要处理，望批准',
    status: 'approved',
    approver: '李经理',
    approvalRemark: '同意，请安排好工作交接',
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
    reason: '身体不适，需要去医院检查',
    status: 'approved',
    approver: '李经理',
    approvalRemark: '注意休息，早日康复',
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
    reason: '下午需要参加孩子的家长会',
    status: 'pending',
    createdAt: '2024-06-20T09:00:00Z',
  },
  {
    id: 'LV004',
    userId: 'U001',
    type: 'annual',
    typeName: '年假',
    startDate: '2024-07-01',
    endDate: '2024-07-05',
    startTime: '09:00',
    endTime: '18:00',
    days: 5,
    reason: '计划外出旅行休息',
    status: 'pending',
    createdAt: '2024-06-18T14:30:00Z',
  },
];

export const statusTextMap: Record<string, string> = {
  pending: '审批中',
  approved: '已通过',
  rejected: '已拒绝',
};

export const statusColorMap: Record<string, string> = {
  pending: '#FF7D00',
  approved: '#00B42A',
  rejected: '#F53F3F',
};

export const mockLeaveBalance = {
  annual: 10,
  sick: 5,
  personal: 3,
  marriage: 10,
  maternity: 158,
  paternity: 15,
  other: 0,
};
