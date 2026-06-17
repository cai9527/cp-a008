import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import dayjs from 'dayjs';
import styles from './index.module.scss';
import { useCheckinStore } from '@/store/useCheckinStore';
import { useAuthStore } from '@/store/useAuthStore';
import { checkinService } from '@/services/checkin';
import StatCard from '@/components/StatCard';

const StatisticsPage: React.FC = () => {
  const { stats, setStats, monthRecords, setMonthRecords } = useCheckinStore();
  const { isLoggedIn, hasRehydrated } = useAuthStore();

  const [currentYear, setCurrentYear] = useState(dayjs().year());
  const [currentMonth, setCurrentMonth] = useState(dayjs().month() + 1);

  const loadData = useCallback(async (year: number, month: number) => {
    console.log('[StatisticsPage] Loading data for:', year, month);
    try {
      const [statsData, records] = await Promise.all([
        checkinService.getStats(year, month),
        checkinService.getMonthRecords(year, month),
      ]);
      setStats(statsData);
      setMonthRecords(records);
    } catch (err) {
      console.error('[StatisticsPage] Load data error:', err);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    }
  }, [setStats, setMonthRecords]);

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

  usePullDownRefresh(async () => {
    console.log('[StatisticsPage] Pull down refresh');
    await loadData(currentYear, currentMonth);
    Taro.stopPullDownRefresh();
  });

  useEffect(() => {
    if (hasRehydrated && !isLoggedIn) {
      Taro.redirectTo({ url: '/pages/login/index' });
    }
  }, [isLoggedIn, hasRehydrated]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    const today = dayjs();
    if (currentYear === today.year() && currentMonth === today.month() + 1) {
      return;
    }
    if (currentMonth === 12) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const trendData = useMemo(() => {
    const daysToShow = Math.min(dayjs(`${currentYear}-${currentMonth}`).daysInMonth(), 30);
    const result: Array<{ day: number; status: string; height: number }> = [];

    const statusHeightMap: Record<string, number> = {
      normal: 100,
      late: 80,
      early: 70,
      absent: 20,
      leave: 50,
      outing: 90,
      weekend: 0,
    };

    for (let i = 1; i <= daysToShow; i++) {
      const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      const record = monthRecords.find((r) => r.date === dateStr);
      const status = record?.status || 'normal';
      result.push({
        day: i,
        status,
        height: statusHeightMap[status] || 0,
      });
    }

    return result;
  }, [currentYear, currentMonth, monthRecords]);

  const statusColorMap: Record<string, string> = {
    normal: '#00B42A',
    late: '#FF7D00',
    early: '#FF7D00',
    absent: '#F53F3F',
    leave: '#1677FF',
    outing: '#722ED1',
    weekend: '#E5E6EB',
  };

  const abnormalData = useMemo(() => {
    if (!stats) return [];
    const total = stats.totalDays || 22;
    return [
      { name: '迟到', count: stats.lateDays, color: '#FF7D00', percent: total ? ((stats.lateDays / total) * 100).toFixed(1) : '0' },
      { name: '早退', count: stats.earlyDays, color: '#FF7D00', percent: total ? ((stats.earlyDays / total) * 100).toFixed(1) : '0' },
      { name: '缺勤', count: stats.absentDays, color: '#F53F3F', percent: total ? ((stats.absentDays / total) * 100).toFixed(1) : '0' },
      { name: '请假', count: stats.leaveDays, color: '#1677FF', percent: total ? ((stats.leaveDays / total) * 100).toFixed(1) : '0' },
      { name: '外勤', count: stats.outingDays, color: '#722ED1', percent: total ? ((stats.outingDays / total) * 100).toFixed(1) : '0' },
    ];
  }, [stats]);

  const ringRotation = useMemo(() => {
    const rate = stats?.attendanceRate || 0;
    return (rate / 100) * 270 - 45;
  }, [stats]);

  return (
    <ScrollView className={styles.page} scrollY>
      <View className="pageContainer">
        <View className={styles.monthSelector}>
          <View className={styles.monthNav} onClick={handlePrevMonth}>‹</View>
          <Text className={styles.monthText}>
            {currentYear}年{currentMonth}月
          </Text>
          <View
            className={styles.monthNav}
            onClick={handleNextMonth}
            style={{ opacity: currentYear === dayjs().year() && currentMonth === dayjs().month() + 1 ? 0.3 : 1 }}
          >
            ›
          </View>
        </View>

        <View className={styles.summaryCard}>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>应出勤天数</Text>
            <Text className={styles.summaryValue}>{stats?.totalDays || 0} 天</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>实际出勤</Text>
            <Text className={styles.summaryValue}>{stats?.presentDays || 0} 天</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>平均工作时长</Text>
            <Text className={styles.summaryValue}>{stats?.avgWorkHours || '0h'}</Text>
          </View>
        </View>

        <View className={styles.statsGrid}>
          <StatCard
            label="出勤率"
            value={`${stats?.attendanceRate || 0}%`}
            color="primary"
            showProgress
            progress={stats?.attendanceRate || 0}
          />
          <StatCard
            label="出勤天数"
            value={stats?.presentDays || 0}
            unit="天"
            color="success"
          />
          <StatCard
            label="迟到次数"
            value={stats?.lateDays || 0}
            unit="次"
            color="warning"
          />
          <StatCard
            label="早退次数"
            value={stats?.earlyDays || 0}
            unit="次"
            color="warning"
          />
        </View>

        <View className={styles.chartCard}>
          <Text className={styles.chartTitle}>出勤率</Text>
          <View className={styles.attendanceRing}>
            <View className={styles.ringContainer}>
              <View className={styles.ringBg} />
              <View
                className={styles.ringProgress}
                style={{ transform: `rotate(${ringRotation}deg)` }}
              />
              <View className={styles.ringContent}>
                <Text className={styles.ringValue}>{stats?.attendanceRate || 0}%</Text>
                <Text className={styles.ringLabel}>本月出勤率</Text>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.chartCard}>
          <Text className={styles.chartTitle}>月度考勤趋势</Text>
          <View className={styles.trendChart}>
            {trendData.slice(0, 15).map((item) => (
              <View
                key={item.day}
                className={styles.trendBar}
                style={{
                  height: `${item.height}%`,
                  backgroundColor: statusColorMap[item.status] || '#E5E6EB',
                  minHeight: item.height > 0 ? '8rpx' : '0',
                }}
              />
            ))}
          </View>
          <View className={styles.trendLabels}>
            {trendData.slice(0, 15).map((item) => (
              <Text key={item.day} className={styles.trendLabel}>
                {item.day}
              </Text>
            ))}
          </View>
        </View>

        <View className={styles.chartCard}>
          <Text className={styles.chartTitle}>异常统计</Text>
          <View className={styles.abnormalList}>
            {abnormalData.map((item) => (
              <View key={item.name} className={styles.abnormalItem}>
                <View className={styles.abnormalInfo}>
                  <View
                    className={styles.abnormalDot}
                    style={{ backgroundColor: item.color }}
                  />
                  <Text className={styles.abnormalName}>{item.name}</Text>
                </View>
                <View className={styles.abnormalRight}>
                  <Text className={styles.abnormalCount} style={{ color: item.color }}>
                    {item.count}
                  </Text>
                  <Text className={styles.abnormalPercent}>占 {item.percent}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.chartCard}>
          <Text className={styles.chartTitle}>工作时长</Text>
          <View className={styles.workHoursCard}>
            <View className={styles.hoursItem}>
              <Text className={styles.hoursValue}>{stats?.avgWorkHours || '0h'}</Text>
              <Text className={styles.hoursLabel}>日均工时</Text>
            </View>
            <View className={styles.hoursItem}>
              <Text className={styles.hoursValue}>8h</Text>
              <Text className={styles.hoursLabel}>标准工时</Text>
            </View>
            <View className={styles.hoursItem}>
              <Text className={styles.hoursValue}>176h</Text>
              <Text className={styles.hoursLabel}>本月累计</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default StatisticsPage;
