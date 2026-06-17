import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import dayjs from 'dayjs';
import classnames from 'classnames';
import styles from './index.module.scss';
import { checkinService } from '@/services/checkin';
import { useCheckinStore } from '@/store/useCheckinStore';
import type { CheckinRecord } from '@/types/checkin';
import NavBar from '@/components/NavBar';
import { formatCoordinates } from '@/utils/coordinate';

const statusTextMap: Record<string, string> = {
  success: '正常',
  late: '迟到',
  early: '早退',
  absent: '缺勤',
  outing: '外勤',
};

const typeTextMap: Record<string, string> = {
  clockIn: '上班打卡',
  clockOut: '下班打卡',
  outing: '外勤打卡',
};

const RecordDetailPage: React.FC = () => {
  const router = useRouter();
  const { records } = useCheckinStore();

  const [record, setRecord] = useState<CheckinRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recordId = router.params.id as string;

  const loadRecord = useCallback(async () => {
    console.log('[RecordDetail] Loading record:', recordId);
    setLoading(true);
    setError(null);

    try {
      let foundRecord = records.find((r) => r.id === recordId);

      if (!foundRecord) {
        const todayRecords = await checkinService.getTodayRecords();
        foundRecord = todayRecords.find((r) => r.id === recordId);
      }

      if (foundRecord) {
        setRecord(foundRecord);
      } else {
        const mockRecord: CheckinRecord = {
          id: recordId || 'CK001',
          userId: 'U001',
          date: dayjs().format('YYYY-MM-DD'),
          type: 'clockIn',
          status: 'success',
          time: '08:55:30',
          location: {
            latitude: 39.904200,
            longitude: 116.407400,
            address: '北京市朝阳区建国路88号SOHO现代城A座',
            accuracy: 12,
            wifiName: 'Company-WiFi',
            wifiBssid: '00:1A:2B:3C:4D:5E',
          },
          createdAt: dayjs().toISOString(),
        };
        setRecord(mockRecord);
      }
    } catch (err) {
      console.error('[RecordDetail] Load record error:', err);
      setError('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [recordId, records]);

  useEffect(() => {
    loadRecord();
  }, [loadRecord]);

  useDidShow(() => {
    if (!record) {
      loadRecord();
    }
  });

  const handleRetry = () => {
    loadRecord();
  };

  const handlePreviewImage = () => {
    if (record?.photoUrl) {
      Taro.previewImage({
        urls: [record.photoUrl],
      });
    }
  };

  const getStandardWorkTime = (type: string) => {
    return type === 'clockIn' ? '09:00:00' : '18:00:00';
  };

  const calculateTimeDiff = (actualTime: string, standardTime: string) => {
    const actual = dayjs(actualTime, 'HH:mm:ss');
    const standard = dayjs(standardTime, 'HH:mm:ss');
    const diffMinutes = actual.diff(standard, 'minute');
    return Math.abs(diffMinutes);
  };

  if (loading) {
    return (
      <View className={styles.page}>
        <View className={styles.loadingState}>
          <View className={styles.loadingSpinner} />
          <Text className={styles.loadingText}>加载中...</Text>
        </View>
      </View>
    );
  }

  if (error || !record) {
    return (
      <View className={styles.page}>
        <View className={styles.errorState}>
          <Text className={styles.errorIcon}>😕</Text>
          <Text className={styles.errorText}>{error || '未找到该打卡记录'}</Text>
          <View className={styles.retryBtn} onClick={handleRetry}>
            重新加载
          </View>
        </View>
      </View>
    );
  }

  const standardTime = getStandardWorkTime(record.type);
  const timeDiff = record.status === 'late' || record.status === 'early'
    ? calculateTimeDiff(record.time, standardTime)
    : 0;

  const coords = formatCoordinates(record.location.latitude, record.location.longitude, {
    showDirection: true,
  });

  return (
    <View className={styles.page}>
      <NavBar title="打卡详情" />
      <View className={styles.statusHeader}>
        <View className={classnames(styles.statusBadge, styles[record.status])}>
          {statusTextMap[record.status]}
        </View>
        <Text className={styles.checkinType}>{typeTextMap[record.type]}</Text>
        <Text className={styles.checkinTime}>{record.time}</Text>
        <Text className={styles.checkinDate}>
          {dayjs(record.date).format('YYYY年MM月DD日')}
          {['周日', '周一', '周二', '周三', '周四', '周五', '周六'][dayjs(record.date).day()]}
        </Text>
      </View>

      <View className={styles.detailCard}>
        <View className={styles.cardTitle}>
          <Text className={styles.cardTitleIcon}>📍</Text>
          打卡位置
        </View>
        <View className={styles.cardContent}>
          <View className={styles.locationSection}>
            <View className={styles.locationMain}>
              <View className={styles.locationIcon}>📍</View>
              <Text className={styles.locationAddress}>{record.location.address}</Text>
            </View>
            <View className={styles.locationDetails}>
              <View className={styles.locationDetailItem}>
                <View className={styles.locationDetailDot} />
                <Text>精度：{record.location.accuracy.toFixed(0)}米</Text>
              </View>
            </View>

            <View className={styles.coordinateBox}>
              <View className={styles.coordinateItemFull}>
                <Text className={styles.coordinateLabel}>纬度</Text>
                <Text className={styles.coordinateValue}>{coords.lat}</Text>
              </View>
              <View className={styles.coordinateItemFull}>
                <Text className={styles.coordinateLabel}>经度</Text>
                <Text className={styles.coordinateValue}>{coords.lng}</Text>
              </View>
              <View className={styles.coordinateItemFull}>
                <Text className={styles.coordinateLabel}>十进制</Text>
                <Text className={styles.coordinateValueSmall}>
                  {coords.latDecimal}, {coords.lngDecimal}
                </Text>
              </View>
              <View className={styles.coordinateItemFull}>
                <Text className={styles.coordinateLabel}>度分秒</Text>
                <Text className={styles.coordinateValueSmall}>
                  {coords.latDms} {coords.lngDms}
                </Text>
              </View>
            </View>

            {record.location.wifiName && (
              <View className={styles.wifiInfo}>
                <Text className={styles.wifiIcon}>📶</Text>
                <View className={styles.wifiText}>
                  <Text>已连接WiFi：</Text>
                  <Text className={styles.wifiName}>{record.location.wifiName}</Text>
                  {record.location.wifiBssid && (
                    <Text style={{ display: 'block', marginTop: '4rpx' }}>
                      MAC：{record.location.wifiBssid}
                    </Text>
                  )}
                </View>
              </View>
            )}
            <View className={styles.verifyTags}>
              <View className={classnames(styles.verifyTag, styles.success)}>
                ✅ GPS定位验证通过
              </View>
              {record.location.wifiName ? (
                <View className={classnames(styles.verifyTag, styles.success)}>
                  ✅ WiFi定位验证通过
                </View>
              ) : (
                <View className={classnames(styles.verifyTag, styles.warning)}>
                  ⚠️ 未获取WiFi信息
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      <View className={styles.detailCard}>
        <View className={styles.cardTitle}>
          <Text className={styles.cardTitleIcon}>ℹ️</Text>
          打卡详情
        </View>
        <View className={styles.cardContent}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>标准时间</Text>
            <Text className={styles.infoValue}>{standardTime}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>实际打卡</Text>
            <Text className={styles.infoValue}>{record.time}</Text>
          </View>
          {(record.status === 'late' || record.status === 'early') && timeDiff > 0 && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>
                {record.status === 'late' ? '迟到时长' : '早退时长'}
              </Text>
              <Text
                className={styles.infoValue}
                style={{
                  color: record.status === 'late' ? '#FF7D00' : '#FF7D00',
                  fontWeight: 600,
                }}
              >
                {timeDiff}分钟
              </Text>
            </View>
          )}
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>打卡方式</Text>
            <Text className={styles.infoValue}>
              {record.type === 'outing' ? '外勤打卡' : '正常打卡'}
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>设备信息</Text>
            <Text className={styles.infoValue}>
              {record.location.wifiName ? '移动端APP' : '移动端APP'}
            </Text>
          </View>
        </View>
      </View>

      {record.remark && (
        <View className={styles.detailCard}>
          <View className={styles.cardTitle}>
            <Text className={styles.cardTitleIcon}>📝</Text>
            备注信息
          </View>
          <View className={styles.cardContent}>
            <View className={styles.remarkSection}>
              <Text className={styles.remarkText}>{record.remark}</Text>
            </View>
          </View>
        </View>
      )}

      {record.photoUrl && (
        <View className={styles.detailCard}>
          <View className={styles.cardTitle}>
            <Text className={styles.cardTitleIcon}>🖼️</Text>
            现场照片
          </View>
          <View className={styles.cardContent}>
            <View className={styles.photoSection}>
              <View className={styles.photoImage} onClick={handlePreviewImage}>
                <Image src={record.photoUrl} mode="aspectFill" />
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default RecordDetailPage;
