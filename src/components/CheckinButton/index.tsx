import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface CheckinButtonProps {
  type: 'clockIn' | 'clockOut' | 'outing';
  status: 'idle' | 'loading' | 'success' | 'disabled';
  onClick: () => void;
  disabled?: boolean;
}

const typeConfig = {
  clockIn: {
    label: '上班打卡',
    subLabel: '09:00 前打卡',
    successLabel: '已打卡',
  },
  clockOut: {
    label: '下班打卡',
    subLabel: '18:00 后打卡',
    successLabel: '已打卡',
  },
  outing: {
    label: '外勤打卡',
    subLabel: '外出工作打卡',
    successLabel: '已打卡',
  },
};

const CheckinButton: React.FC<CheckinButtonProps> = ({ type, status, onClick, disabled }) => {
  const config = typeConfig[type];

  return (
    <View
      className={classnames(
        styles.button,
        styles[type],
        status === 'loading' && styles.loading,
        status === 'success' && styles.success,
        (status === 'disabled' || disabled) && styles.disabled
      )}
      onClick={() => {
        if (status !== 'loading' && status !== 'disabled' && !disabled) {
          onClick();
        }
      }}
    >
      {status === 'loading' ? (
        <View className={styles.loadingContent}>
          <View className={styles.spinner} />
          <Text className={styles.loadingText}>定位中...</Text>
        </View>
      ) : status === 'success' ? (
        <View className={styles.successContent}>
          <Text className={styles.successIcon}>✓</Text>
          <Text className={styles.successLabel}>{config.successLabel}</Text>
        </View>
      ) : (
        <View className={styles.content}>
          <Text className={styles.label}>{config.label}</Text>
          <Text className={styles.subLabel}>{config.subLabel}</Text>
        </View>
      )}
    </View>
  );
};

export default CheckinButton;
