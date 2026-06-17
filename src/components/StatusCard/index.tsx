import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface StatusCardProps {
  title: string;
  value: string | number;
  unit?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'purple';
  icon?: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ title, value, unit, color = 'primary', icon }) => {
  return (
    <View className={classnames(styles.card, styles[`color${color.charAt(0).toUpperCase() + color.slice(1)}`])}>
      <View className={styles.header}>
        {icon && <Text className={styles.icon}>{icon}</Text>}
        <Text className={styles.title}>{title}</Text>
      </View>
      <View className={styles.valueWrapper}>
        <Text className={styles.value}>{value}</Text>
        {unit && <Text className={styles.unit}>{unit}</Text>}
      </View>
    </View>
  );
};

export default StatusCard;
