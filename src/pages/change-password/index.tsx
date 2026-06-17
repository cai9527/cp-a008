import React, { useState, useMemo } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import NavBar from '@/components/NavBar';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/useAuthStore';

interface PasswordStrength {
  level: number;
  label: string;
  color: string;
}

const getCharTypeCount = (password: string): number => {
  let count = 0;
  if (/[a-z]/.test(password)) count++;
  if (/[A-Z]/.test(password)) count++;
  if (/\d/.test(password)) count++;
  if (/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(password)) count++;
  return count;
};

const ChangePasswordPage: React.FC = () => {
  const { logout } = useAuthStore();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [oldPasswordFocused, setOldPasswordFocused] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordStrength = useMemo<PasswordStrength>(() => {
    if (!newPassword) {
      return { level: 0, label: '', color: '' };
    }

    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[a-z]/.test(newPassword)) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/\d/.test(newPassword)) score++;
    if (/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(newPassword)) score++;

    if (score <= 2) {
      return { level: 1, label: '弱', color: 'weak' };
    } else if (score <= 3) {
      return { level: 2, label: '中', color: 'medium' };
    } else {
      return { level: 3, label: '强', color: 'strong' };
    }
  }, [newPassword]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!oldPassword) {
      newErrors.oldPassword = '请输入当前密码';
    } else if (oldPassword.length < 6) {
      newErrors.oldPassword = '当前密码长度不能少于6位';
    }

    if (!newPassword) {
      newErrors.newPassword = '请输入新密码';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = '新密码长度不能少于8位';
    } else if (newPassword.length > 20) {
      newErrors.newPassword = '新密码长度不能超过20位';
    } else if (/\s/.test(newPassword)) {
      newErrors.newPassword = '新密码不能包含空格';
    } else if (getCharTypeCount(newPassword) < 3) {
      newErrors.newPassword = '新密码需包含大写字母、小写字母、数字、特殊字符中至少3类';
    } else if (newPassword === oldPassword) {
      newErrors.newPassword = '新密码不能与当前密码相同';
    } else {
      let similarityCount = 0;
      for (let i = 0; i < oldPassword.length && i < newPassword.length; i++) {
        if (oldPassword[i] === newPassword[i]) {
          similarityCount++;
        }
      }
      const similarityThreshold = Math.min(oldPassword.length, newPassword.length) * 0.6;
      if (similarityCount > similarityThreshold) {
        newErrors.newPassword = '新密码与当前密码过于相似，请重新设置';
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = '请再次输入新密码';
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = '两次输入的新密码不一致';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async () => {
    console.log('[ChangePassword] Handle submit');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await authService.updatePassword(oldPassword, newPassword);

      console.log('[ChangePassword] Submit success');

      await Taro.showModal({
        title: '密码修改成功',
        content: '为了您的账户安全，请使用新密码重新登录。',
        showCancel: false,
        confirmText: '去登录',
      });

      logout();
      Taro.reLaunch({ url: '/pages/login/index' });
    } catch (err) {
      console.error('[ChangePassword] Submit error:', err);
      let message = '密码修改失败，请稍后重试';
      if (err instanceof Error) {
        message = err.message;
        if (message.includes('当前密码')) {
          setErrors({ oldPassword: message });
        } else if (
          message.includes('新密码') ||
          message.includes('长度') ||
          message.includes('空格') ||
          message.includes('字母') ||
          message.includes('数字') ||
          message.includes('特殊字符') ||
          message.includes('相似') ||
          message.includes('强度')
        ) {
          setErrors({ newPassword: message });
        }
      }
      Taro.showToast({
        title: message,
        icon: 'none',
        duration: 2500,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    oldPassword.length >= 6 &&
    newPassword.length >= 8 &&
    newPassword.length <= 20 &&
    !/\s/.test(newPassword) &&
    getCharTypeCount(newPassword) >= 3 &&
    confirmPassword.length >= 8 &&
    !submitting;

  return (
    <View className={styles.page}>
      <NavBar title="修改密码" />
      <View className="pageContainer">
        <View className={styles.tipCard}>
          <Text className={styles.tipIcon}>🔐</Text>
          <View className={styles.tipContent}>
            <Text className={styles.tipTitle}>密码安全提示</Text>
            <Text className={styles.tipText}>
              为了您的账户安全，密码需满足以下要求：
            </Text>
            <View className={styles.tipList}>
              <Text className={styles.tipListItem}>· 长度不少于 8 位，不超过 20 位</Text>
              <Text className={styles.tipListItem}>· 不能包含空格</Text>
              <Text className={styles.tipListItem}>· 需包含以下 4 类字符中至少 3 类：</Text>
              <Text className={styles.tipListItem}>　 大写字母 (A-Z)、小写字母 (a-z)、数字 (0-9)、特殊字符 (!@#$%^&amp;* 等)</Text>
            </View>
          </View>
        </View>

        <View className={styles.formCard}>
          <View className={styles.formItem}>
            <Text className={classnames(styles.formLabel, styles.formLabelRequired)}>
              当前密码
            </Text>
            <View
              className={classnames(
                styles.inputWrapper,
                oldPasswordFocused && styles.focused,
                errors.oldPassword && styles.error
              )}
            >
              <Text className={styles.inputIcon}>🔒</Text>
              <Input
                className={styles.input}
                password={!showOldPassword}
                maxlength={20}
                placeholder="请输入当前密码"
                value={oldPassword}
                onInput={(e) => {
                  setOldPassword(e.detail.value);
                  clearError('oldPassword');
                }}
                onFocus={() => setOldPasswordFocused(true)}
                onBlur={() => setOldPasswordFocused(false)}
              />
              <Text
                className={styles.toggleIcon}
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                {showOldPassword ? '🙈' : '👁️'}
              </Text>
            </View>
            {errors.oldPassword && (
              <Text className={styles.errorText}>{errors.oldPassword}</Text>
            )}
          </View>

          <View className={styles.formItem}>
            <Text className={classnames(styles.formLabel, styles.formLabelRequired)}>
              新密码
            </Text>
            <View
              className={classnames(
                styles.inputWrapper,
                newPasswordFocused && styles.focused,
                errors.newPassword && styles.error
              )}
            >
              <Text className={styles.inputIcon}>🔑</Text>
              <Input
                className={styles.input}
                password={!showNewPassword}
                maxlength={20}
                placeholder="请输入新密码"
                value={newPassword}
                onInput={(e) => {
                  setNewPassword(e.detail.value);
                  clearError('newPassword');
                }}
                onFocus={() => setNewPasswordFocused(true)}
                onBlur={() => setNewPasswordFocused(false)}
              />
              <Text
                className={styles.toggleIcon}
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? '🙈' : '👁️'}
              </Text>
            </View>
            {newPassword && (
              <View className={styles.strengthBar}>
                <View className={styles.strengthLabel}>
                  <Text className={styles.strengthLabelText}>密码强度：</Text>
                  <Text className={classnames(styles.strengthValue, styles[passwordStrength.color])}>
                    {passwordStrength.label}
                  </Text>
                </View>
                <View className={styles.strengthTrack}>
                  {[1, 2, 3].map((level) => (
                    <View
                      key={level}
                      className={classnames(
                        styles.strengthFill,
                        level <= passwordStrength.level && styles[passwordStrength.color]
                      )}
                    />
                  ))}
                </View>
              </View>
            )}
            {errors.newPassword && (
              <Text className={styles.errorText}>{errors.newPassword}</Text>
            )}
          </View>

          <View className={styles.formItem}>
            <Text className={classnames(styles.formLabel, styles.formLabelRequired)}>
              确认新密码
            </Text>
            <View
              className={classnames(
                styles.inputWrapper,
                confirmPasswordFocused && styles.focused,
                errors.confirmPassword && styles.error
              )}
            >
              <Text className={styles.inputIcon}>✅</Text>
              <Input
                className={styles.input}
                password={!showConfirmPassword}
                maxlength={20}
                placeholder="请再次输入新密码"
                value={confirmPassword}
                onInput={(e) => {
                  setConfirmPassword(e.detail.value);
                  clearError('confirmPassword');
                }}
                onFocus={() => setConfirmPasswordFocused(true)}
                onBlur={() => setConfirmPasswordFocused(false)}
              />
              <Text
                className={styles.toggleIcon}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </Text>
            </View>
            {errors.confirmPassword && (
              <Text className={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>
        </View>
      </View>

      <View className={styles.submitBar}>
        <View
          className={classnames(styles.submitBtn, (!canSubmit || submitting) && styles.disabled)}
          onClick={canSubmit && !submitting ? handleSubmit : undefined}
        >
          {submitting ? '提交中...' : '确认修改'}
        </View>
      </View>

      {submitting && (
        <View className={styles.loadingOverlay}>
          <View className={styles.loadingContent}>
            <View className={styles.spinner} />
            <Text className={styles.loadingText}>正在修改密码...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default ChangePasswordPage;
