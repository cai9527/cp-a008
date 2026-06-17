import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

export interface LoadingProps {
  visible: boolean;
  text?: string;
  transparent?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ visible, text = '加载中...', transparent = false }) => {
  if (!visible) return null;

  return (
    <View className={classnames(styles.overlay, transparent && styles.transparent)}>
      <View className={styles.content}>
        <View className={styles.spinner} />
        <Text className={styles.text}>{text}</Text>
      </View>
    </View>
  );
};

export default Loading;
