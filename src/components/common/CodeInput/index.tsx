import React, { useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';

export interface CodeInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  codeLength?: number;
  onSendCode: () => Promise<void> | void;
  disabled?: boolean;
  countdownSeconds?: number;
  required?: boolean;
  error?: string;
  icon?: string;
}

const CodeInput: React.FC<CodeInputProps> = ({
  label = '验证码',
  placeholder = '请输入验证码',
  value,
  onChange,
  codeLength = 6,
  onSendCode,
  disabled = false,
  countdownSeconds = 60,
  required = false,
  error,
  icon = '🔐',
}) => {
  const [countdown, setCountdown] = useState(0);
  const [focused, setFocused] = useState(false);

  const handleSendCode = async () => {
    if (countdown > 0 || disabled) return;

    try {
      await onSendCode();
      setCountdown(countdownSeconds);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('[CodeInput] Send code error:', err);
      Taro.showToast({
        title: err instanceof Error ? err.message : '发送失败',
        icon: 'none',
      });
    }
  };

  return (
    <View className={styles.formItem}>
      {label && (
        <Text className={classnames(styles.formLabel, required && styles.formLabelRequired)}>
          {label}
        </Text>
      )}
      <View
        className={classnames(
          styles.codeInputWrapper,
          focused && styles.focused,
          error && styles.error
        )}
      >
        <Text className={styles.inputIcon}>{icon}</Text>
        <Input
          className={styles.input}
          type="number"
          maxlength={codeLength}
          placeholder={placeholder}
          value={value}
          onInput={(e) => onChange(e.detail.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
        />
        <View
          className={classnames(styles.codeBtn, (countdown > 0 || disabled) && styles.disabled)}
          onClick={handleSendCode}
        >
          {countdown > 0 ? `${countdown}s` : '获取验证码'}
        </View>
      </View>
      {error && <Text className={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default CodeInput;
