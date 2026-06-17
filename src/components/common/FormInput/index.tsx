import React, { useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

export interface FormInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'idcard' | 'digit';
  password?: boolean;
  maxlength?: number;
  icon?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  showToggle?: boolean;
  suffix?: React.ReactNode;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  password = false,
  maxlength,
  icon,
  required = false,
  error,
  disabled = false,
  showToggle = false,
  suffix,
  onFocus,
  onBlur,
  className,
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = () => {
    setFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setFocused(false);
    onBlur?.();
  };

  const handleInput = (e: any) => {
    onChange(e.detail.value);
  };

  const isPasswordType = password && showToggle;
  const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

  return (
    <View className={classnames(styles.formItem, className)}>
      {label && (
        <Text className={classnames(styles.formLabel, required && styles.formLabelRequired)}>
          {label}
        </Text>
      )}
      <View
        className={classnames(
          styles.inputWrapper,
          focused && styles.focused,
          error && styles.error,
          disabled && styles.disabled
        )}
      >
        {icon && <Text className={styles.inputIcon}>{icon}</Text>}
        <Input
          className={styles.input}
          type={inputType as any}
          password={isPasswordType ? !showPassword : password}
          maxlength={maxlength}
          placeholder={placeholder}
          value={value}
          onInput={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
        />
        {isPasswordType && (
          <Text
            className={styles.toggleIcon}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '🙈' : '👁️'}
          </Text>
        )}
        {suffix}
      </View>
      {error && <Text className={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default FormInput;
