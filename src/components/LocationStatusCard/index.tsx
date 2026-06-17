import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { LocationStatus } from '@/hooks/useLocation';
import type { LocationInfo } from '@/types/checkin';
import { formatCoordinates } from '@/utils/coordinate';

interface LocationStatusCardProps {
  status: LocationStatus;
  location: LocationInfo | null;
  error: string | null;
  retryCount: number;
  onRefresh: () => void;
  onRetry?: () => void;
  timestamp?: number | null;
}

const LocationStatusCard: React.FC<LocationStatusCardProps> = ({
  status,
  location,
  error,
  retryCount,
  onRefresh,
  onRetry,
  timestamp,
}) => {
  const formatTime = (ts?: number | null) => {
    if (!ts) return '';
    const date = new Date(ts);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const renderLocating = () => (
    <View className={styles.statusLocating}>
      <View className={styles.iconBoxLocating}>
        <View className={styles.radarWrap}>
          <View className={styles.radarCircle} />
          <View className={styles.radarCircle} />
          <View className={styles.radarCircle} />
        </View>
        <Text className={styles.iconLocating}>📍</Text>
      </View>
      <View className={styles.statusContent}>
        <Text className={styles.statusTitle}>正在定位中...</Text>
        <Text className={styles.statusSubtitle}>
          正在获取高精度位置信息，请确保在开阔地带
        </Text>
        <View className={styles.progressBar}>
          <View className={styles.progressFill} />
        </View>
      </View>
    </View>
  );

  const renderSuccess = () => {
    const coords = location
      ? formatCoordinates(location.latitude, location.longitude, {
          showDirection: true,
        })
      : null;

    return (
      <View className={styles.statusSuccess}>
        <View className={styles.iconBoxSuccess}>
          <Text className={styles.iconSuccess}>✅</Text>
        </View>
        <View className={styles.statusContent}>
          <Text className={styles.statusTitle}>定位成功</Text>
          <Text className={styles.locationAddress}>{location?.address}</Text>
          <View className={styles.locationMeta}>
            <View className={styles.metaItem}>
              <Text className={styles.metaLabel}>精度</Text>
              <Text
                className={classnames(
                  styles.metaValue,
                  location && location.accuracy <= 20 ? styles.accuracyGood : styles.accuracyFair
                )}
              >
                {location?.accuracy}米
              </Text>
            </View>
            {location?.wifiName && (
              <View className={styles.metaItem}>
                <Text className={styles.metaLabel}>WiFi</Text>
                <Text className={styles.metaValue}>{location.wifiName}</Text>
              </View>
            )}
            {timestamp && (
              <View className={styles.metaItem}>
                <Text className={styles.metaLabel}>更新</Text>
                <Text className={styles.metaValue}>{formatTime(timestamp)}</Text>
              </View>
            )}
          </View>
          {coords && (
            <View className={styles.coordBox}>
              <View className={styles.coordRow}>
                <View className={styles.coordItem}>
                  <Text className={styles.coordLabel}>纬度</Text>
                  <Text className={styles.coordValue}>{coords.lat}</Text>
                </View>
                <View className={styles.coordDivider} />
                <View className={styles.coordItem}>
                  <Text className={styles.coordLabel}>经度</Text>
                  <Text className={styles.coordValue}>{coords.lng}</Text>
                </View>
              </View>
              <View className={styles.coordRow}>
                <Text className={styles.coordDecimalLabel}>十进制坐标</Text>
                <Text className={styles.coordDecimalValue}>
                  {coords.latDecimal}, {coords.lngDecimal}
                </Text>
              </View>
              <View className={styles.coordRow}>
                <Text className={styles.coordDmsLabel}>度分秒坐标</Text>
                <Text className={styles.coordDmsValue}>
                  {coords.latDms}  {coords.lngDms}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderError = () => (
    <View className={styles.statusError}>
      <View className={styles.iconBoxError}>
        <Text className={styles.iconError}>⚠️</Text>
      </View>
      <View className={styles.statusContent}>
        <Text className={styles.statusTitleError}>定位失败</Text>
        <Text className={styles.errorText}>{error}</Text>
        {retryCount > 0 && (
          <Text className={styles.retryHint}>已重试 {retryCount} 次</Text>
        )}
        <View className={styles.errorActions}>
          <View className={styles.retryBtn} onClick={onRetry || onRefresh}>
            <Text className={styles.retryBtnText}>重新定位</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderIdle = () => (
    <View className={styles.statusIdle}>
      <View className={styles.iconBoxIdle}>
        <Text className={styles.iconIdle}>📡</Text>
      </View>
      <View className={styles.statusContent}>
        <Text className={styles.statusTitle}>等待定位</Text>
        <Text className={styles.statusSubtitle}>点击下方按钮开始获取位置信息</Text>
      </View>
    </View>
  );

  const renderStatus = () => {
    switch (status) {
      case 'locating':
        return renderLocating();
      case 'success':
        return renderSuccess();
      case 'error':
        return renderError();
      case 'idle':
      default:
        return renderIdle();
    }
  };

  return (
    <View
      className={classnames(
        styles.card,
        status === 'locating' && styles.cardLocating,
        status === 'success' && styles.cardSuccess,
        status === 'error' && styles.cardError
      )}
    >
      <View className={styles.cardHeader}>
        <View className={styles.headerLeft}>
          <View
            className={classnames(
              styles.statusDot,
              status === 'locating' && styles.statusDotLocating,
              status === 'success' && styles.statusDotSuccess,
              status === 'error' && styles.statusDotError
            )}
          />
          <Text className={styles.cardTitle}>当前位置</Text>
        </View>
        <View
          className={classnames(
            styles.refreshBtn,
            status === 'locating' && styles.refreshBtnDisabled
          )}
          onClick={status !== 'locating' ? onRefresh : undefined}
        >
          {status === 'locating' ? (
            <View className={styles.refreshSpinner} />
          ) : (
            <Text className={styles.refreshIcon}>⟳</Text>
          )}
          <Text className={styles.refreshText}>
            {status === 'locating' ? '定位中' : '刷新'}
          </Text>
        </View>
      </View>
      <View className={styles.cardBody}>{renderStatus()}</View>
    </View>
  );
};

export default LocationStatusCard;
