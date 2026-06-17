import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

export type PasswordStrengthLevel = 0 | 1 | 2 | 3;

export interface PasswordStrengthProps {
  password: string;
}

interface StrengthInfo {
  level: PasswordStrengthLevel;
  label: string;
  color: 'weak' | 'medium' | 'strong' | '';
}

const getCharTypeCount = (password: string): number => {
  let count = 0;
  if (/[a-z]/.test(password)) count++;
  if (/[A-Z]/.test(password)) count++;
  if (/\d/.test(password)) count++;
  if (/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(password)) count++;
  return count;
};

export { getCharTypeCount };

export const calculatePasswordStrength = (password: string): StrengthInfo => {
  if (!password) {
    return { level: 0, label: '', color: '' };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(password)) score++;

  if (score <= 2) {
    return { level: 1, label: '弱', color: 'weak' };
  } else if (score <= 3) {
    return { level: 2, label: '中', color: 'medium' };
  } else {
    return { level: 3, label: '强', color: 'strong' };
  }
};

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const strength = useMemo<StrengthInfo>(() => {
    return calculatePasswordStrength(password);
  }, [password]);

  if (!password) return null;

  return (
    <View className={styles.strengthBar}>
      <View className={styles.strengthLabel}>
        <Text className={styles.strengthLabelText}>密码强度：</Text>
        <Text className={classnames(styles.strengthValue, styles[strength.color])}>
          {strength.label}
        </Text>
      </View>
      <View className={styles.strengthTrack}>
        {[1, 2, 3].map((level) => (
          <View
            key={level}
            className={classnames(
              styles.strengthFill,
              level <= strength.level && styles[strength.color]
            )}
          />
        ))}
      </View>
    </View>
  );
};

export default PasswordStrength;
