export type LeaveType = 'annual' | 'sick' | 'personal' | 'marriage' | 'maternity' | 'paternity' | 'other';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRecord {
  id: string;
  userId: string;
  type: LeaveType;
  typeName: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  days: number;
  reason: string;
  attachmentUrl?: string;
  status: LeaveStatus;
  approver?: string;
  approvalRemark?: string;
  createdAt: string;
}

export interface LeaveApplyParams {
  type: LeaveType;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  attachmentUrl?: string;
}

export const leaveTypeOptions: { value: LeaveType; label: string }[] = [
  { value: 'annual', label: '年假' },
  { value: 'sick', label: '病假' },
  { value: 'personal', label: '事假' },
  { value: 'marriage', label: '婚假' },
  { value: 'maternity', label: '产假' },
  { value: 'paternity', label: '陪产假' },
  { value: 'other', label: '其他' },
];
