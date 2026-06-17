import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useClock } from '@/hooks/useClock';
import { useLocation } from '@/hooks/useLocation';
import { useAuthStore } from '@/store/useAuthStore';
import { useCheckinStore } from '@/store/useCheckinStore';
import { checkinService } from '@/services/checkin';
import CheckinButton from '@/components/CheckinButton';
import LocationStatusCard from '@/components/LocationStatusCard';
import RecordItem from '@/components/RecordItem';
import type { CheckinRecord } from '@/types/checkin';

const HomePage: React.FC = () => {
  const { dateStr, timeStr, weekday, now } = useClock();
  const {
    status: locationStatus,
    location,
    error: locationError,
    retryCount,
    timestamp,
    getLocation,
    retry,
    validateLocation,
    isLocating,
    isSuccess,
  } = useLocation();
  const { userInfo, isLoggedIn, hasRehydrated } = useAuthStore();
  const { todayRecords, addRecord, setTodayRecords } = useCheckinStore();

  const [clockInStatus, setClockInStatus] = useState<'idle' | 'loading' | 'success' | 'disabled'>('idle');
  const [clockOutStatus, setClockOutStatus] = useState<'idle' | 'loading' | 'success' | 'disabled'>('idle');
  const [hasClockIn, setHasClockIn] = useState(false);
  const [hasClockOut, setHasClockOut] = useState(false);
  const [clockInTime, setClockInTime] = useState<string>('');
  const [clockOutTime, setClockOutTime] = useState<string>('');

  const loadData = useCallback(async () => {
    console.log('[HomePage] Loading data...');
    try {
      await getLocation();
      const records = await checkinService.getTodayRecords();
      setTodayRecords(records);

      const clockIn = records.find((r) => r.type === 'clockIn');
      const clockOut = records.find((r) => r.type === 'clockOut');

      setHasClockIn(!!clockIn);
      setHasClockOut(!!clockOut);
      setClockInTime(clockIn?.time || '');
      setClockOutTime(clockOut?.time || '');

      if (clockIn) setClockInStatus('success');
      if (clockOut) setClockOutStatus('success');

      const hour = now.hour();
      if (hour >= 18 && !clockOut) {
        setClockOutStatus('idle');
      }
    } catch (err) {
      console.error('[HomePage] Load data error:', err);
    }
  }, [getLocation, setTodayRecords, now]);

  useEffect(() => {
    if (hasRehydrated && isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn, hasRehydrated, loadData]);

  useDidShow(() => {
    if (hasRehydrated && isLoggedIn) {
      loadData();
    }
  });

  usePullDownRefresh(async () => {
    console.log('[HomePage] Pull down refresh');
    await loadData();
    Taro.stopPullDownRefresh();
  });

  useEffect(() => {
    if (hasRehydrated && !isLoggedIn) {
      Taro.redirectTo({ url: '/pages/login/index' });
    }
  }, [isLoggedIn, hasRehydrated]);

  const handleCheckin = async (type: 'clockIn' | 'clockOut') => {
    console.log('[HomePage] Handle checkin:', type, 'locationStatus:', locationStatus);

    if (isLocating) {
      Taro.showToast({ title: '正在定位中，请稍候...', icon: 'none' });
      return;
    }

    if (!isSuccess || !location) {
      Taro.showToast({ title: '正在获取位置...', icon: 'none' });
      const loc = await getLocation(true);
      if (!loc) {
        Taro.showToast({ title: '获取位置失败，请重试', icon: 'none' });
        return;
      }
    }

    const validation = validateLocation(location!);
    if (!validation.valid) {
      Taro.showModal({
        title: '打卡提醒',
        content: validation.reason || '当前位置不满足打卡要求',
        confirmText: '重新定位',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            getLocation(true);
          }
        },
      });
      return;
    }

    const setStatus = type === 'clockIn' ? setClockInStatus : setClockOutStatus;
    setStatus('loading');

    try {
      const record = await checkinService.doCheckin(type, location!);
      addRecord(record);

      if (type === 'clockIn') {
        setHasClockIn(true);
        setClockInTime(record.time);
        setClockInStatus('success');
      } else {
        setHasClockOut(true);
        setClockOutTime(record.time);
        setClockOutStatus('success');
      }

      const statusText = {
        success: '打卡成功',
        late: '打卡成功（迟到）',
        early: '打卡成功（早退）',
        outing: '外勤打卡成功',
      }[record.status];

      Taro.showToast({
        title: statusText,
        icon: 'success',
      });

      console.log('[HomePage] Checkin success:', record);
    } catch (err) {
      console.error('[HomePage] Checkin error:', err);
      setStatus('idle');
      Taro.showToast({
        title: err instanceof Error ? err.message : '打卡失败',
        icon: 'none',
      });
    }
  };

  const handleGoOuting = () => {
    Taro.navigateTo({ url: '/pages/field-checkin/index' });
  };

  const handleGoLeave = () => {
    Taro.navigateTo({ url: '/pages/leave-apply/index' });
  };

  const handleViewRecords = () => {
    Taro.switchTab({ url: '/pages/records/index' });
  };

  const handleRecordClick = (record: CheckinRecord) => {
    Taro.navigateTo({
      url: `/pages/record-detail/index?id=${record.id}`,
    });
  };

  const handleRefreshLocation = () => {
    getLocation(true);
  };

  const getGreeting = () => {
    const hour = now.hour();
    if (hour < 6) return '夜深了';
    if (hour < 9) return '早上好';
    if (hour < 12) return '上午好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  const hour = now.hour();
  const showClockIn = hour < 12 || !hasClockIn;
  const showClockOut = hour >= 12 || hasClockIn;

  return (
    <ScrollView className={styles.page} scrollY>
      <View className="pageContainer">
        <View className={styles.header}>
          <Text className={styles.welcome}>
            {getGreeting()}，{userInfo?.name || '用户'}
          </Text>
          <Text className={styles.dateText}>{dateStr} {weekday}</Text>
        </View>

        <View className={styles.clockSection}>
          <Text className={styles.clock}>{timeStr}</Text>
          <Text className={styles.weekday}>{weekday}</Text>
        </View>

        <View className={styles.checkinSection}>
          {showClockIn && (
            <View className={classnames(styles.statusBadge, styles.left)}>
              <Text className={styles.statusLabel}>上班</Text>
              <Text className={styles.statusTime}>
                {hasClockIn ? clockInTime : '09:00'}
              </Text>
              <View className={classnames(styles.statusDot, hasClockIn ? styles.success : styles.waiting)} />
            </View>
          )}

          {showClockIn && !hasClockIn ? (
            <CheckinButton
              type="clockIn"
              status={clockInStatus}
              onClick={() => handleCheckin('clockIn')}
            />
          ) : showClockOut && !hasClockOut ? (
            <CheckinButton
              type="clockOut"
              status={clockOutStatus}
              onClick={() => handleCheckin('clockOut')}
            />
          ) : (
            <CheckinButton
              type={hasClockOut ? 'clockOut' : 'clockIn'}
              status="success"
              onClick={() => {}}
              disabled
            />
          )}

          {showClockOut && (
            <View className={classnames(styles.statusBadge, styles.right)}>
              <Text className={styles.statusLabel}>下班</Text>
              <Text className={styles.statusTime}>
                {hasClockOut ? clockOutTime : '18:00'}
              </Text>
              <View className={classnames(styles.statusDot, hasClockOut ? styles.success : styles.waiting)} />
            </View>
          )}
        </View>

        <LocationStatusCard
          status={locationStatus}
          location={location}
          error={locationError}
          retryCount={retryCount}
          timestamp={timestamp}
          onRefresh={handleRefreshLocation}
          onRetry={retry}
        />

        <View className={styles.quickActions}>
          <Text className={styles.sectionTitle}>快捷功能</Text>
          <View className={styles.actionGrid}>
            <View className={styles.actionCard} onClick={handleGoOuting}>
              <View className={classnames(styles.actionIcon, styles.outing)}>🚶</View>
              <Text className={styles.actionText}>外勤打卡</Text>
            </View>
            <View className={styles.actionCard} onClick={handleGoLeave}>
              <View className={classnames(styles.actionIcon, styles.leave)}>📝</View>
              <Text className={styles.actionText}>请假申请</Text>
            </View>
          </View>
        </View>

        <View className={styles.todayRecords}>
          <View className={styles.todayHeader}>
            <Text className={styles.todayTitle}>今日打卡</Text>
            <Text className={styles.viewAll} onClick={handleViewRecords}>查看全部</Text>
          </View>
          {todayRecords.length > 0 ? (
            todayRecords.map((record) => (
              <RecordItem
                key={record.id}
                record={record}
                onClick={() => handleRecordClick(record)}
              />
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyText}>暂无打卡记录</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
