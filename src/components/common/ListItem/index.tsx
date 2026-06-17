import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

export interface ListItemProps {
  title: string;
  description?: string;
  extra?: React.ReactNode;
  showArrow?: boolean;
  onClick?: () => void;
  className?: string;
}

const ListItem: React.FC<ListItemProps> = ({
  title,
  description,
  extra,
  showArrow = false,
  onClick,
  className,
}) => {
  return (
    <View
      className={classnames(styles.listItem, className)}
      onClick={onClick}
    >
      <View className={styles.content}>
        <Text className={styles.title}>{title}</Text>
        {description && <Text className={styles.description}>{description}</Text>}
      </View>
      {extra && <View className={styles.extra}>{extra}</View>}
      {showArrow && <Text className={styles.arrow}>›</Text>}
    </View>
  );
};

export default ListItem;
