import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subValue?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'purple';
  showProgress?: boolean;
  progress?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  subValue,
  color = 'primary',
  showProgress,
  progress,
}) => {
  return (
    <View className={classnames(styles.card, styles[color])}>
      <Text className={styles.label}>{label}</Text>
      <View className={styles.valueRow}>
        <Text className={styles.value}>
          {value}
          {unit && <Text className={styles.unit}>{unit}</Text>}
        </Text>
        {subValue && <Text className={styles.subValue}>{subValue}</Text>}
      </View>
      {showProgress && progress !== undefined && (
        <View className={styles.progressBar}>
          <View className={styles.progressFill} style={{ width: `${Math.min(progress, 100)}%` }} />
        </View>
      )}
    </View>
  );
};

export default StatCard;
