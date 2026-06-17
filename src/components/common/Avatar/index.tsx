import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  src?: string;
  text?: string;
  size?: AvatarSize;
  shape?: 'circle' | 'square';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  text,
  size = 'md',
  shape = 'circle',
  className,
}) => {
  const displayText = text ? text.charAt(0).toUpperCase() : '';

  return (
    <View
      className={classnames(
        styles.avatar,
        styles[size],
        shape === 'circle' && styles.circle,
        shape === 'square' && styles.square,
        className
      )}
    >
      {src ? (
        <Image className={styles.image} src={src} mode="aspectFill" />
      ) : (
        <Text className={styles.text}>{displayText}</Text>
      )}
    </View>
  );
};

export default Avatar;
