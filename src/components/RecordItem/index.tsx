import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';
import type { CheckinRecord } from '@/types/checkin';

export interface RecordItemProps {
  record: CheckinRecord;
  onClick?: () => void;
}

const typeTextMap: Record<string, string> = {
  clockIn: '上班打卡',
  clockOut: '下班打卡',
  outing: '外勤打卡',
};

const statusConfig: Record<string, { text: string; color: string }> = {
  success: { text: '正常', color: '#00B42A' },
  late: { text: '迟到', color: '#FF7D00' },
  early: { text: '早退', color: '#FF7D00' },
  absent: { text: '缺勤', color: '#F53F3F' },
  outing: { text: '外勤', color: '#722ED1' },
};

const RecordItem: React.FC<RecordItemProps> = ({ record, onClick }) => {
  const status = statusConfig[record.status] || statusConfig.success;
  const typeText = typeTextMap[record.type] || '打卡';

  return (
    <View className={styles.item} onClick={onClick}>
      <View className={styles.left}>
        <View
          className={classnames(styles.typeIcon, styles[record.type])}
        >
          <Text className={styles.iconText}>
            {record.type === 'clockIn' ? '上' : record.type === 'clockOut' ? '下' : '外'}
          </Text>
        </View>
        <View className={styles.info}>
          <Text className={styles.type}>{typeText}</Text>
          <Text className={styles.address}>{record.location.address}</Text>
          {record.location.wifiName && (
            <Text className={styles.wifi}>WiFi: {record.location.wifiName}</Text>
          )}
        </View>
      </View>
      <View className={styles.right}>
        <Text className={styles.time}>{record.time}</Text>
        <Text className={styles.status} style={{ color: status.color }}>
          {status.text}
        </Text>
      </View>
    </View>
  );
};

export default RecordItem;
