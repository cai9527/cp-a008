import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import dayjs from 'dayjs';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useCheckinStore } from '@/store/useCheckinStore';
import { useAuthStore } from '@/store/useAuthStore';
import { checkinService } from '@/services/checkin';
import Calendar from '@/components/Calendar';
import RecordItem from '@/components/RecordItem';
import type { CheckinRecord } from '@/types/checkin';

const filterOptions = [
  { key: 'all', label: '全部' },
  { key: 'abnormal', label: '异常' },
  { key: 'late', label: '迟到' },
  { key: 'early', label: '早退' },
  { key: 'absent', label: '缺勤' },
  { key: 'outing', label: '外勤' },
];

const statusTextMap: Record<string, string> = {
  normal: '正常',
  late: '迟到',
  early: '早退',
  absent: '缺勤',
  leave: '请假',
  outing: '外勤',
  weekend: '周末',
};

const RecordsPage: React.FC = () => {
  const { monthRecords, setMonthRecords, stats, setStats } = useCheckinStore();
  const { isLoggedIn, hasRehydrated } = useAuthStore();

  const [currentYear, setCurrentYear] = useState(dayjs().year());
  const [currentMonth, setCurrentMonth] = useState(dayjs().month() + 1);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [activeFilter, setActiveFilter] = useState('all');

  const loadData = useCallback(async (year: number, month: number) => {
    console.log('[RecordsPage] Loading data for:', year, month);
    try {
      const [records, statsData] = await Promise.all([
        checkinService.getMonthRecords(year, month),
        checkinService.getStats(year, month),
      ]);
      setMonthRecords(records);
      setStats(statsData);
    } catch (err) {
      console.error('[RecordsPage] Load data error:', err);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    }
  }, [setMonthRecords, setStats]);

  useEffect(() => {
    if (hasRehydrated && isLoggedIn) {
      loadData(currentYear, currentMonth);
    }
  }, [currentYear, currentMonth, loadData, isLoggedIn, hasRehydrated]);

  useDidShow(() => {
    if (hasRehydrated && isLoggedIn) {
      loadData(currentYear, currentMonth);
    }
  });

  useEffect(() => {
    if (hasRehydrated && !isLoggedIn) {
      Taro.redirectTo({ url: '/pages/login/index' });
    }
  }, [isLoggedIn, hasRehydrated]);

  usePullDownRefresh(async () => {
    console.log('[RecordsPage] Pull down refresh');
    await loadData(currentYear, currentMonth);
    Taro.stopPullDownRefresh();
  });

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleGoToday = () => {
    const today = dayjs();
    setCurrentYear(today.year());
    setCurrentMonth(today.month() + 1);
    setSelectedDate(today.format('YYYY-MM-DD'));
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleRecordClick = (record: CheckinRecord) => {
    Taro.navigateTo({
      url: `/pages/record-detail/index?id=${record.id}`,
    });
  };

  const selectedDayRecord = useMemo(() => {
    return monthRecords.find((r) => r.date === selectedDate);
  }, [monthRecords, selectedDate]);

  const filteredRecords = useMemo(() => {
    if (!selectedDayRecord) return [];

    const records: CheckinRecord[] = [];
    if (selectedDayRecord.clockIn) records.push(selectedDayRecord.clockIn);
    if (selectedDayRecord.clockOut) records.push(selectedDayRecord.clockOut);

    if (activeFilter === 'all') return records;
    if (activeFilter === 'abnormal') {
      return records.filter((r) => r.status === 'late' || r.status === 'early' || r.status === 'absent');
    }
    return records.filter((r) => r.status === activeFilter);
  }, [selectedDayRecord, activeFilter]);

  const monthStats = useMemo(() => {
    if (!stats) {
      return {
        present: 0,
        late: 0,
        early: 0,
        rate: 0,
      };
    }
    return {
      present: stats.presentDays,
      late: stats.lateDays,
      early: stats.earlyDays,
      rate: stats.attendanceRate,
    };
  }, [stats]);

  const displayStatus = selectedDayRecord?.status || 'normal';

  return (
    <ScrollView className={styles.page} scrollY>
      <View className="pageContainer">
        <View className={styles.monthHeader}>
          <View className={styles.monthNav} onClick={handlePrevMonth}>‹</View>
          <Text className={styles.monthTitle}>
            {currentYear}年{currentMonth}月
          </Text>
          <View className={styles.todayBtn} onClick={handleGoToday}>今天</View>
          <View className={styles.monthNav} onClick={handleNextMonth}>›</View>
        </View>

        <ScrollView className={styles.statsRow} scrollX>
          <View className={classnames(styles.statItem, styles.success)}>
            <Text className={styles.statValue}>{monthStats.present}</Text>
            <Text className={styles.statLabel}>出勤天数</Text>
          </View>
          <View className={classnames(styles.statItem, styles.warning)}>
            <Text className={styles.statValue}>{monthStats.late}</Text>
            <Text className={styles.statLabel}>迟到次数</Text>
          </View>
          <View className={classnames(styles.statItem, styles.warning)}>
            <Text className={styles.statValue}>{monthStats.early}</Text>
            <Text className={styles.statLabel}>早退次数</Text>
          </View>
          <View className={classnames(styles.statItem, styles.primary)}>
            <Text className={styles.statValue}>{monthStats.rate}%</Text>
            <Text className={styles.statLabel}>出勤率</Text>
          </View>
        </ScrollView>

        <View className={styles.statusLegend}>
          <View className={styles.legendItem}>
            <View className={styles.legendDot} style={{ backgroundColor: '#00B42A' }} />
            <Text>正常</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={styles.legendDot} style={{ backgroundColor: '#FF7D00' }} />
            <Text>迟到/早退</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={styles.legendDot} style={{ backgroundColor: '#F53F3F' }} />
            <Text>缺勤</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={styles.legendDot} style={{ backgroundColor: '#1677FF' }} />
            <Text>请假</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={styles.legendDot} style={{ backgroundColor: '#722ED1' }} />
            <Text>外勤</Text>
          </View>
        </View>

        <View className={styles.calendarSection}>
          <Calendar
            year={currentYear}
            month={currentMonth}
            records={monthRecords}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </View>

        <View className={styles.selectedDateInfo}>
          <Text className={styles.selectedDate}>
            {dayjs(selectedDate).format('MM月DD日')} {['周日', '周一', '周二', '周三', '周四', '周五', '周六'][dayjs(selectedDate).day()]}
          </Text>
          <View className={classnames(styles.selectedStatus, styles[displayStatus])}>
            {statusTextMap[displayStatus] || '正常'}
          </View>
        </View>

        <ScrollView className={styles.filterTabs} scrollX>
          {filterOptions.map((option) => (
            <View
              key={option.key}
              className={classnames(styles.filterTab, activeFilter === option.key && styles.active)}
              onClick={() => setActiveFilter(option.key)}
            >
              {option.label}
            </View>
          ))}
        </ScrollView>

        <View className={styles.recordsList}>
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <RecordItem
                key={record.id}
                record={record}
                onClick={() => handleRecordClick(record)}
              />
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📋</Text>
              <Text className={styles.emptyText}>
                {selectedDayRecord?.status === 'weekend' ? '今天是周末' :
                 selectedDayRecord?.status === 'leave' ? '今天请假' :
                 selectedDayRecord?.status === 'absent' ? '今日缺勤' :
                 '暂无打卡记录'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default RecordsPage;
