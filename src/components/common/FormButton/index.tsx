import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

export type ButtonType = 'primary' | 'success' | 'warning' | 'error' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface FormButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: ButtonType;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  block?: boolean;
  className?: string;
}

const FormButton: React.FC<FormButtonProps> = ({
  children,
  onClick,
  type = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  loadingText = '加载中...',
  block = true,
  className,
}) => {
  const handleClick = () => {
    if (!disabled && !loading) {
      onClick?.();
    }
  };

  return (
    <View
      className={classnames(
        styles.btn,
        styles[type],
        styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`],
        !block && styles.inline,
        (disabled || loading) && styles.disabled,
        className
      )}
      onClick={handleClick}
    >
      {loading ? (
        <View className={styles.loadingWrapper}>
          <View className={styles.spinner} />
          <Text className={styles.loadingText}>{loadingText}</Text>
        </View>
      ) : (
        children
      )}
    </View>
  );
};

export default FormButton;
