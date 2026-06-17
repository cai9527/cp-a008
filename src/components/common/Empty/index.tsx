import React from 'react';
import { View, Text } from '@tarojs/components';
import FormButton from '../FormButton';
import styles from './index.module.scss';

export interface EmptyProps {
  icon?: string;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

const Empty: React.FC<EmptyProps> = ({
  icon = '📭',
  title = '暂无数据',
  description,
  actionText,
  onAction,
}) => {
  return (
    <View className={styles.empty}>
      <Text className={styles.icon}>{icon}</Text>
      <Text className={styles.title}>{title}</Text>
      {description && <Text className={styles.description}>{description}</Text>}
      {actionText && onAction && (
        <View className={styles.action}>
          <FormButton size="sm" type="outline" onClick={onAction} block={false}>
            {actionText}
          </FormButton>
        </View>
      )}
    </View>
  );
};

export default Empty;
