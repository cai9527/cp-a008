import React from 'react';
import { View } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

export type TagType = 'primary' | 'success' | 'warning' | 'error' | 'purple' | 'default';

export interface TagProps {
  children: React.ReactNode;
  type?: TagType;
  size?: 'sm' | 'md';
  plain?: boolean;
  round?: boolean;
  className?: string;
}

const Tag: React.FC<TagProps> = ({
  children,
  type = 'default',
  size = 'sm',
  plain = false,
  round = false,
  className,
}) => {
  return (
    <View
      className={classnames(
        styles.tag,
        styles[type],
        styles[size],
        plain && styles.plain,
        round && styles.round,
        className
      )}
    >
      {children}
    </View>
  );
};

export default Tag;
