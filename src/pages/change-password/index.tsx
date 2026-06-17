import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import {
  NavBar,
  FormInput,
  FormButton,
  PasswordStrength,
  Loading,
  createValidator,
  validateForm,
  type ValidatorFn,
} from '@/common';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/useAuthStore';

interface FormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordPage: React.FC = () => {
  const { logout } = useAuthStore();
  const [formData, setFormData] = useState<FormData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const getRules = (): Record<keyof FormData, ValidatorFn[]> => ({
    oldPassword: [
      createValidator.required(),
      createValidator.minLength(6),
    ],
    newPassword: [
      createValidator.required(),
      createValidator.password(),
      createValidator.passwordNotSame(formData.oldPassword),
    ],
    confirmPassword: [
      createValidator.required(),
      createValidator.passwordConfirm(formData.newPassword),
    ],
  });

  const handleChange = (field: keyof FormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const doValidate = (): boolean => {
    const result = validateForm<FormData>(formData, getRules());
    setErrors(result.errors);
    if (!result.valid && result.firstError) {
      Taro.showToast({ title: result.firstError, icon: 'none' });
    }
    return result.valid;
  };

  const handleSubmit = async () => {
    if (!doValidate()) return;

    setSubmitting(true);
    try {
      await authService.updatePassword(formData.oldPassword, formData.newPassword);

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
    formData.oldPassword.length >= 6 &&
    formData.newPassword.length >= 8 &&
    formData.confirmPassword.length >= 8 &&
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
          <FormInput
            label="当前密码"
            required
            icon="🔒"
            placeholder="请输入当前密码"
            password
            showToggle
            value={formData.oldPassword}
            onChange={handleChange('oldPassword')}
            error={errors.oldPassword}
            maxlength={20}
          />
          {formData.newPassword && (
            <View className="mbMd">
              <FormInput
                label="新密码"
                required
                icon="🔑"
                placeholder="请输入新密码"
                password
                showToggle
                value={formData.newPassword}
                onChange={handleChange('newPassword')}
                error={errors.newPassword}
                maxlength={20}
              />
              <PasswordStrength password={formData.newPassword} />
            </View>
          )}
          {!formData.newPassword && (
            <FormInput
              label="新密码"
              required
              icon="🔑"
              placeholder="请输入新密码"
              password
              showToggle
              value={formData.newPassword}
              onChange={handleChange('newPassword')}
              error={errors.newPassword}
              maxlength={20}
            />
          )}
          <FormInput
            label="确认新密码"
            required
            icon="✅"
            placeholder="请再次输入新密码"
            password
            showToggle
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            error={errors.confirmPassword}
            maxlength={20}
          />
        </View>
      </View>

      <View className={styles.submitBar}>
        <FormButton
          type="primary"
          size="md"
          disabled={!canSubmit}
          loading={submitting}
          loadingText="提交中..."
          onClick={handleSubmit}
        >
          确认修改
        </FormButton>
      </View>

      <Loading visible={submitting} text="正在修改密码..." />
    </View>
  );
};

export default ChangePasswordPage;
