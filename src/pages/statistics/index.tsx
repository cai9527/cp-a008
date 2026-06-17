import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import dayjs from 'dayjs';
import styles from './index.module.scss';
import { useCheckinStore } from '@/store/useCheckinStore';
import { useAuthStore } from '@/store/useAuthStore';
import { checkinService } from '@/services/checkin';
import StatCard from '@/components/StatCard';
import DetailPopup from '@/components/DetailPopup';
import type { DayCheckinInfo } from '@/types/checkin';

type PopupMode = 'trend' | 'abnormal' | 'attendance' | 'hours' | null;

const statusLabelMap: Record<string, string> = {
  normal: '正常',
  late: '迟到',
  early: '早退',
  absent: '缺勤',
  leave: '请假',
  outing: '外勤',
  weekend: '休息',
};

const abnormalKeyMap: Record<string, string> = {
  '迟到': 'late',
  '早退': 'early',
  '缺勤': 'absent',
  '请假': 'leave',
  '外勤': 'outing',
};

const StatisticsPage: React.FC = () => {
  const { stats, setStats, monthRecords, setMonthRecords } = useCheckinStore();
  const { isLoggedIn, hasRehydrated } = useAuthStore();

  const [currentYear, setCurrentYear] = useState(dayjs().year());
  const [currentMonth, setCurrentMonth] = useState(dayjs().month() + 1);
  const [loading, setLoading] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMode, setPopupMode] = useState<PopupMode>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedAbnormalKey, setSelectedAbnormalKey] = useState<string>('');
  const [selectedHoursItem, setSelectedHoursItem] = useState<string>('');
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadData = useCallback(async (year: number, month: number) => {
    setLoading(true);
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
    } finally {
      setLoading(false);
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

  const openPopup = (mode: PopupMode) => {
    setPopupMode(mode);
    setPopupVisible(true);
  };

  const closePopup = () => {
    setPopupVisible(false);
    setTimeout(() => {
      setPopupMode(null);
      setSelectedDay(null);
      setSelectedAbnormalKey('');
      setSelectedHoursItem('');
    }, 300);
  };

  const handleTrendBarClick = (day: number) => {
    setSelectedDay(day);
    setLoadingDetail(true);
    setTimeout(() => {
      setLoadingDetail(false);
      openPopup('trend');
    }, 200);
  };

  const handleAbnormalClick = (name: string) => {
    setSelectedAbnormalKey(name);
    setLoadingDetail(true);
    setTimeout(() => {
      setLoadingDetail(false);
      openPopup('abnormal');
    }, 200);
  };

  const handleStatCardClick = (label: string) => {
    setLoadingDetail(true);
    setTimeout(() => {
      setLoadingDetail(false);
      if (label === '出勤率' || label === '出勤天数') {
        openPopup('attendance');
      } else if (label === '迟到次数' || label === '早退次数') {
        setSelectedAbnormalKey(label === '迟到次数' ? '迟到' : '早退');
        openPopup('abnormal');
      }
    }, 200);
  };

  const handleAttendanceRingClick = () => {
    setLoadingDetail(true);
    setTimeout(() => {
      setLoadingDetail(false);
      openPopup('attendance');
    }, 200);
  };

  const handleHoursClick = (itemLabel?: string) => {
    if (itemLabel) {
      setSelectedHoursItem(itemLabel);
      Taro.showToast({
        title: `查看${itemLabel}详情`,
        icon: 'none',
        duration: 1000,
      });
    }
    setLoadingDetail(true);
    setTimeout(() => {
      setLoadingDetail(false);
      openPopup('hours');
    }, 200);
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
      result.push({ day: i, status, height: statusHeightMap[status] || 0 });
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

  const selectedDayRecord = useMemo((): DayCheckinInfo | null => {
    if (selectedDay === null) return null;
    const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`;
    return monthRecords.find((r) => r.date === dateStr) || null;
  }, [currentYear, currentMonth, selectedDay, monthRecords]);

  const filteredAbnormalRecords = useMemo((): DayCheckinInfo[] => {
    const statusKey = abnormalKeyMap[selectedAbnormalKey];
    if (!statusKey) return [];
    return monthRecords.filter((r) => r.status === statusKey);
  }, [selectedAbnormalKey, monthRecords]);

  const attendanceDetailData = useMemo(() => {
    if (!stats) return [];
    return [
      { label: '应出勤', value: `${stats.totalDays}天`, color: '#1D2129' },
      { label: '实际出勤', value: `${stats.presentDays}天`, color: '#00B42A' },
      { label: '出勤率', value: `${stats.attendanceRate}%`, color: '#1677FF' },
      { label: '迟到', value: `${stats.lateDays}天`, color: '#FF7D00' },
      { label: '早退', value: `${stats.earlyDays}天`, color: '#FF7D00' },
      { label: '缺勤', value: `${stats.absentDays}天`, color: '#F53F3F' },
      { label: '请假', value: `${stats.leaveDays}天`, color: '#1677FF' },
      { label: '外勤', value: `${stats.outingDays}天`, color: '#722ED1' },
    ];
  }, [stats]);

  const hoursDetailData = useMemo(() => {
    if (!stats) return [];
    const avgHours = parseFloat(stats.avgWorkHours) || 0;
    return [
      { label: '日均工时', value: stats.avgWorkHours || '0h', highlight: false },
      { label: '标准工时', value: '8h', highlight: false },
      { label: '本月累计', value: '176h', highlight: false },
      { label: '加班时长', value: `${Math.max(0, (avgHours - 8) * (stats?.presentDays || 0)).toFixed(1)}h`, highlight: avgHours > 8 },
      { label: '是否达标', value: avgHours >= 8 ? '已达标' : '未达标', highlight: avgHours < 8 },
    ];
  }, [stats]);

  const popupTitle = useMemo(() => {
    if (!popupMode) return '';
    switch (popupMode) {
      case 'trend': return selectedDay ? `${currentMonth}月${selectedDay}日 考勤详情` : '考勤详情';
      case 'abnormal': return `${selectedAbnormalKey}记录`;
      case 'attendance': return '出勤率详情';
      case 'hours': return '工作时长详情';
      default: return '详情';
    }
  }, [popupMode, currentMonth, selectedDay, selectedAbnormalKey]);

  const renderTrendDetail = () => {
    if (loadingDetail) return (
      <View className={styles.detailLoading}>
        <View className={styles.detailLoadingSpinner} />
        <Text className={styles.detailLoadingText}>加载中...</Text>
      </View>
    );
    if (!selectedDayRecord) {
      return <View className={styles.detailEmpty}><Text className={styles.detailEmptyText}>暂无该日考勤记录</Text></View>;
    }
    const r = selectedDayRecord;
    return (
      <View className={styles.detailContent}>
        <View className={styles.detailStatusRow}>
          <View className={styles.detailStatusBadge} style={{ backgroundColor: statusColorMap[r.status] || '#E5E6EB' }}>
            <Text className={styles.detailStatusText}>{statusLabelMap[r.status] || r.status}</Text>
          </View>
          {r.workDuration && <Text className={styles.detailWorkDuration}>工时 {r.workDuration}</Text>}
        </View>

        {r.clockIn && (
          <View className={styles.detailSection}>
            <Text className={styles.detailSectionTitle}>上班打卡</Text>
            <View className={styles.detailRow}>
              <Text className={styles.detailLabel}>打卡时间</Text>
              <Text className={styles.detailValue}>{r.clockIn.time}</Text>
            </View>
            <View className={styles.detailRow}>
              <Text className={styles.detailLabel}>打卡状态</Text>
              <Text className={styles.detailValue} style={{ color: r.clockIn.status === 'late' ? '#FF7D00' : '#00B42A' }}>
                {r.clockIn.status === 'late' ? '迟到' : '正常'}
              </Text>
            </View>
            {r.clockIn.location && (
              <View className={styles.detailRow}>
                <Text className={styles.detailLabel}>打卡地点</Text>
                <Text className={styles.detailValue}>{r.clockIn.location.address}</Text>
              </View>
            )}
            {r.clockIn.location?.wifiName && (
              <View className={styles.detailRow}>
                <Text className={styles.detailLabel}>WiFi验证</Text>
                <Text className={styles.detailValue}>{r.clockIn.location.wifiName}</Text>
              </View>
            )}
          </View>
        )}

        {r.clockOut && (
          <View className={styles.detailSection}>
            <Text className={styles.detailSectionTitle}>下班打卡</Text>
            <View className={styles.detailRow}>
              <Text className={styles.detailLabel}>打卡时间</Text>
              <Text className={styles.detailValue}>{r.clockOut.time}</Text>
            </View>
            <View className={styles.detailRow}>
              <Text className={styles.detailLabel}>打卡状态</Text>
              <Text className={styles.detailValue} style={{ color: r.clockOut.status === 'early' ? '#FF7D00' : '#00B42A' }}>
                {r.clockOut.status === 'early' ? '早退' : '正常'}
              </Text>
            </View>
            {r.clockOut.location && (
              <View className={styles.detailRow}>
                <Text className={styles.detailLabel}>打卡地点</Text>
                <Text className={styles.detailValue}>{r.clockOut.location.address}</Text>
              </View>
            )}
          </View>
        )}

        {!r.clockIn && !r.clockOut && r.status !== 'weekend' && (
          <View className={styles.detailSection}>
            <Text className={styles.detailEmptyText}>该日无打卡记录</Text>
          </View>
        )}
      </View>
    );
  };

  const renderAbnormalDetail = () => {
    if (loadingDetail) return (
      <View className={styles.detailLoading}>
        <View className={styles.detailLoadingSpinner} />
        <Text className={styles.detailLoadingText}>加载中...</Text>
      </View>
    );
    if (filteredAbnormalRecords.length === 0) {
      return <View className={styles.detailEmpty}><Text className={styles.detailEmptyText}>暂无{selectedAbnormalKey}记录</Text></View>;
    }
    return (
      <View className={styles.detailContent}>
        {filteredAbnormalRecords.map((record) => (
          <View key={record.date} className={styles.abnormalRecordItem}>
            <View className={styles.abnormalRecordHeader}>
              <Text className={styles.abnormalRecordDate}>{record.date}</Text>
              <View className={styles.detailStatusBadge} style={{ backgroundColor: statusColorMap[record.status] || '#E5E6EB' }}>
                <Text className={styles.detailStatusText}>{statusLabelMap[record.status] || record.status}</Text>
              </View>
            </View>
            <View className={styles.abnormalRecordTimes}>
              {record.clockIn && (
                <Text className={styles.abnormalRecordTime}>上班 {record.clockIn.time}</Text>
              )}
              {record.clockOut && (
                <Text className={styles.abnormalRecordTime}>下班 {record.clockOut.time}</Text>
              )}
              {!record.clockIn && !record.clockOut && (
                <Text className={styles.abnormalRecordTime}>无打卡记录</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderAttendanceDetail = () => {
    if (loadingDetail) return (
      <View className={styles.detailLoading}>
        <View className={styles.detailLoadingSpinner} />
        <Text className={styles.detailLoadingText}>加载中...</Text>
      </View>
    );
    return (
      <View className={styles.detailContent}>
        {attendanceDetailData.map((item) => (
          <View key={item.label} className={styles.detailRow}>
            <Text className={styles.detailLabel}>{item.label}</Text>
            <Text className={styles.detailValue} style={{ color: item.color }}>{item.value}</Text>
          </View>
        ))}
        <View className={styles.detailSection}>
          <Text className={styles.detailSectionTitle}>出勤率计算</Text>
          <View className={styles.detailRow}>
            <Text className={styles.detailLabel}>公式</Text>
            <Text className={styles.detailValueSmall}>实际出勤 / 应出勤 × 100%</Text>
          </View>
          <View className={styles.detailRow}>
            <Text className={styles.detailLabel}>计算</Text>
            <Text className={styles.detailValueSmall}>
              {stats?.presentDays || 0} / {stats?.totalDays || 0} × 100% = {stats?.attendanceRate || 0}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderHoursDetail = () => {
    if (loadingDetail) return (
      <View className={styles.detailLoading}>
        <View className={styles.detailLoadingSpinner} />
        <Text className={styles.detailLoadingText}>加载中...</Text>
      </View>
    );
    return (
      <View className={styles.detailContent}>
        {hoursDetailData.map((item) => (
          <View key={item.label} className={styles.detailRow}>
            <Text className={styles.detailLabel}>{item.label}</Text>
            <Text className={styles.detailValue} style={{ color: item.highlight ? '#F53F3F' : '#1D2129' }}>
              {item.value}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderPopupContent = () => {
    switch (popupMode) {
      case 'trend': return renderTrendDetail();
      case 'abnormal': return renderAbnormalDetail();
      case 'attendance': return renderAttendanceDetail();
      case 'hours': return renderHoursDetail();
      default: return null;
    }
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className="pageContainer">
        {loading && (
          <View className={styles.loadingBar}>
            <View className={styles.loadingBarInner} />
          </View>
        )}

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
          <View className={styles.statCardWrapper} onClick={() => handleStatCardClick('出勤率')}>
            <StatCard label="出勤率" value={`${stats?.attendanceRate || 0}%`} color="primary" showProgress progress={stats?.attendanceRate || 0} />
          </View>
          <View className={styles.statCardWrapper} onClick={() => handleStatCardClick('出勤天数')}>
            <StatCard label="出勤天数" value={stats?.presentDays || 0} unit="天" color="success" />
          </View>
          <View className={styles.statCardWrapper} onClick={() => handleStatCardClick('迟到次数')}>
            <StatCard label="迟到次数" value={stats?.lateDays || 0} unit="次" color="warning" />
          </View>
          <View className={styles.statCardWrapper} onClick={() => handleStatCardClick('早退次数')}>
            <StatCard label="早退次数" value={stats?.earlyDays || 0} unit="次" color="warning" />
          </View>
        </View>

        <View className={styles.chartCard} onClick={handleAttendanceRingClick}>
          <Text className={styles.chartTitle}>出勤率</Text>
          <View className={styles.attendanceRing}>
            <View className={styles.ringContainer}>
              <View className={styles.ringBg} />
              <View className={styles.ringProgress} style={{ transform: `rotate(${ringRotation}deg)` }} />
              <View className={styles.ringContent}>
                <Text className={styles.ringValue}>{stats?.attendanceRate || 0}%</Text>
                <Text className={styles.ringLabel}>本月出勤率</Text>
              </View>
            </View>
          </View>
          <View className={styles.clickHint}>
            <Text className={styles.clickHintText}>点击查看详情</Text>
          </View>
        </View>

        <View className={styles.chartCard}>
          <Text className={styles.chartTitle}>月度考勤趋势</Text>
          <View className={styles.trendChart}>
            {trendData.slice(0, 15).map((item) => (
              <View
                key={item.day}
                className={`${styles.trendBar} ${selectedDay === item.day ? styles.trendBarActive : ''}`}
                style={{
                  height: `${item.height}%`,
                  backgroundColor: statusColorMap[item.status] || '#E5E6EB',
                  minHeight: item.height > 0 ? '8rpx' : '0',
                }}
                onClick={() => handleTrendBarClick(item.day)}
              />
            ))}
          </View>
          <View className={styles.trendLabels}>
            {trendData.slice(0, 15).map((item) => (
              <Text
                key={item.day}
                className={`${styles.trendLabel} ${selectedDay === item.day ? styles.trendLabelActive : ''}`}
                onClick={() => handleTrendBarClick(item.day)}
              >
                {item.day}
              </Text>
            ))}
          </View>
          <View className={styles.clickHint}>
            <Text className={styles.clickHintText}>点击柱状条或日期标签查看当日详情</Text>
          </View>
        </View>

        <View className={styles.chartCard}>
          <Text className={styles.chartTitle}>异常统计</Text>
          <View className={styles.abnormalList}>
            {abnormalData.map((item) => (
              <View
                key={item.name}
                className={`${styles.abnormalItem} ${styles.abnormalItemClickable} ${selectedAbnormalKey === item.name ? styles.abnormalItemSelected : ''}`}
                onClick={() => handleAbnormalClick(item.name)}
              >
                <View className={styles.abnormalInfo}>
                  <View className={styles.abnormalDot} style={{ backgroundColor: item.color }} />
                  <Text className={styles.abnormalName}>{item.name}</Text>
                </View>
                <View className={styles.abnormalRight}>
                  <Text className={styles.abnormalCount} style={{ color: item.color }}>{item.count}</Text>
                  <Text className={styles.abnormalPercent}>占 {item.percent}%</Text>
                  <Text className={styles.abnormalArrow}>›</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.chartCard} onClick={() => handleHoursClick()}>
          <Text className={styles.chartTitle}>工作时长</Text>
          <View className={styles.workHoursCard}>
            <View
              className={`${styles.hoursItem} ${selectedHoursItem === '日均工时' ? styles.hoursItemActive : ''}`}
              onClick={(e) => { e.stopPropagation(); handleHoursClick('日均工时'); }}
            >
              <Text className={styles.hoursValue}>{stats?.avgWorkHours || '0h'}</Text>
              <Text className={styles.hoursLabel}>日均工时</Text>
            </View>
            <View
              className={`${styles.hoursItem} ${selectedHoursItem === '标准工时' ? styles.hoursItemActive : ''}`}
              onClick={(e) => { e.stopPropagation(); handleHoursClick('标准工时'); }}
            >
              <Text className={styles.hoursValue}>8h</Text>
              <Text className={styles.hoursLabel}>标准工时</Text>
            </View>
            <View
              className={`${styles.hoursItem} ${selectedHoursItem === '本月累计' ? styles.hoursItemActive : ''}`}
              onClick={(e) => { e.stopPropagation(); handleHoursClick('本月累计'); }}
            >
              <Text className={styles.hoursValue}>176h</Text>
              <Text className={styles.hoursLabel}>本月累计</Text>
            </View>
          </View>
          <View className={styles.clickHint}>
            <Text className={styles.clickHintText}>点击卡片或数据项查看详情</Text>
          </View>
        </View>
      </View>

      <DetailPopup visible={popupVisible} title={popupTitle} onClose={closePopup}>
        {renderPopupContent()}
      </DetailPopup>
    </ScrollView>
  );
};

export default StatisticsPage;
