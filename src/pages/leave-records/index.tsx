import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { leaveService } from '@/services/leave';
import type { LeaveRecord } from '@/types/leave';
import NavBar from '@/components/NavBar';

const filterOptions = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待审批' },
  { key: 'approved', label: '已通过' },
  { key: 'rejected', label: '已拒绝' },
];

const statusTextMap: Record<string, string> = {
  pending: '待审批',
  approved: '已通过',
  rejected: '已拒绝',
};

const LeaveRecordsPage: React.FC = () => {
  const [records, setRecords] = useState<LeaveRecord[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async (status?: string) => {
    console.log('[LeaveRecords] Loading data, status:', status);
    setLoading(true);
    try {
      const data = await leaveService.getRecords(status);
      setRecords(data);
    } catch (err) {
      console.error('[LeaveRecords] Load data error:', err);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(activeFilter === 'all' ? undefined : activeFilter);
  }, [activeFilter, loadData]);

  useDidShow(() => {
    loadData(activeFilter === 'all' ? undefined : activeFilter);
  });

  usePullDownRefresh(async () => {
    console.log('[LeaveRecords] Pull down refresh');
    await loadData(activeFilter === 'all' ? undefined : activeFilter);
    Taro.stopPullDownRefresh();
  });

  const handleFilterChange = (key: string) => {
    setActiveFilter(key);
  };

  const handleApplyNew = () => {
    Taro.navigateTo({
      url: '/pages/leave-apply/index',
    });
  };

  const handleCancel = async (record: LeaveRecord) => {
    if (record.status !== 'pending') return;

    const res = await Taro.showModal({
      title: '确认撤销',
      content: '确定要撤销该请假申请吗？',
      confirmText: '确认撤销',
      cancelText: '取消',
    });

    if (!res.confirm) return;

    try {
      await leaveService.cancel(record.id);
      Taro.showToast({ title: '已撤销', icon: 'success' });
      loadData(activeFilter === 'all' ? undefined : activeFilter);
    } catch (err) {
      console.error('[LeaveRecords] Cancel error:', err);
      Taro.showToast({ title: '撤销失败', icon: 'none' });
    }
  };

  const handleRecordClick = (record: LeaveRecord) => {
    console.log('[LeaveRecords] Record clicked:', record.id);
  };

  const filteredRecords = useMemo(() => {
    if (activeFilter === 'all') return records;
    return records.filter((r) => r.status === activeFilter);
  }, [records, activeFilter]);

  return (
    <View className={styles.page}>
      <NavBar title="请假记录" />
      <ScrollView scrollY className={styles.scrollContent}>
        <View className={styles.filterTabs}>
        {filterOptions.map((option) => (
          <View
            key={option.key}
            className={classnames(styles.filterTab, activeFilter === option.key && styles.active)}
            onClick={() => handleFilterChange(option.key)}
          >
            {option.label}
          </View>
        ))}
      </View>

      <View className={styles.recordsList}>
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <View
              key={record.id}
              className={styles.recordCard}
              onClick={() => handleRecordClick(record)}
            >
              <View className={styles.recordHeader}>
                <View className={styles.recordType}>
                  <View className={styles.recordTypeIcon}>
                    {record.type === 'annual' && '🏖️'}
                    {record.type === 'sick' && '🏥'}
                    {record.type === 'personal' && '📋'}
                    {record.type === 'marriage' && '💒'}
                    {record.type === 'maternity' && '👶'}
                    {record.type === 'paternity' && '👨‍👩‍👧'}
                    {record.type === 'other' && '📝'}
                  </View>
                  <Text className={styles.recordTypeText}>{record.typeName}</Text>
                </View>
                <View className={classnames(styles.recordStatus, styles[record.status])}>
                  {statusTextMap[record.status]}
                </View>
              </View>

              <View className={styles.recordDates}>
                <View className={styles.recordDateRow}>
                  <Text className={styles.recordDateLabel}>开始时间</Text>
                  <Text className={styles.recordDateValue}>
                    {record.startDate} {record.startTime}
                  </Text>
                </View>
                <View className={styles.recordDateRow}>
                  <Text className={styles.recordDateLabel}>结束时间</Text>
                  <Text className={styles.recordDateValue}>
                    {record.endDate} {record.endTime}
                  </Text>
                </View>
              </View>

              <View className={styles.recordDays}>
                <Text className={styles.recordDaysValue}>{record.days}</Text>
                <Text className={styles.recordDaysUnit}>天</Text>
              </View>

              <Text className={styles.recordReason}>{record.reason}</Text>

              {record.approver && (
                <View className={styles.recordApproval}>
                  <View className={styles.recordApprovalRow}>
                    <Text className={styles.recordApprovalLabel}>审批人</Text>
                    <Text className={styles.recordApprovalValue}>{record.approver}</Text>
                  </View>
                  {record.approvalRemark && (
                    <View className={styles.recordApprovalRow}>
                      <Text className={styles.recordApprovalLabel}>审批意见</Text>
                      <Text className={styles.recordApprovalValue}>{record.approvalRemark}</Text>
                    </View>
                  )}
                </View>
              )}

              {record.status === 'pending' && (
                <View className={styles.recordActions}>
                  <View
                    className={classnames(styles.actionBtn, styles.cancel)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancel(record);
                    }}
                  >
                    撤销申请
                  </View>
                </View>
              )}
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📝</Text>
            <Text className={styles.emptyText}>
              {activeFilter === 'all'
                ? '暂无请假记录'
                : `暂无${statusTextMap[activeFilter] || ''}的请假记录`}
            </Text>
            <View className={styles.emptyBtn} onClick={handleApplyNew}>
              申请请假
            </View>
          </View>
        )}

        {loading && filteredRecords.length > 0 && (
          <View className={styles.loadingMore}>加载中...</View>
        )}
      </View>
      </ScrollView>
    </View>
  );
};

export default LeaveRecordsPage;
