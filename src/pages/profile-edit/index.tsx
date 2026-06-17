import React, { useState, useMemo } from 'react';
import { View, Text, Input, Image, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import NavBar from '@/components/NavBar';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/auth';
import type { UserInfo } from '@/types/auth';

interface ProfileFormData {
  name: string;
  phone: string;
  department: string;
  position: string;
  avatar?: string;
}

const departmentOptions = [
  '技术研发部',
  '产品设计部',
  '市场营销部',
  '人力资源部',
  '财务部',
  '运营部',
  '行政部',
  '客户服务部',
];

const positionOptions = [
  '高级前端工程师',
  '前端工程师',
  '后端工程师',
  '产品经理',
  'UI设计师',
  '测试工程师',
  '运营专员',
  '市场专员',
  '人事专员',
  '财务专员',
];

const ProfileEditPage: React.FC = () => {
  const { userInfo, updateUserInfo } = useAuthStore();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: userInfo?.name || '',
    phone: userInfo?.phone || '',
    department: userInfo?.department || '',
    position: userInfo?.position || '',
    avatar: userInfo?.avatar || '',
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '姓名至少需要2个字符';
    } else if (formData.name.trim().length > 20) {
      newErrors.name = '姓名不能超过20个字符';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '请输入手机号码';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入正确的手机号码';
    }

    if (!formData.department) {
      newErrors.department = '请选择所属部门';
    }

    if (!formData.position) {
      newErrors.position = '请选择职位';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleAvatarClick = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        if (tempFilePaths && tempFilePaths.length > 0) {
          handleInputChange('avatar', tempFilePaths[0]);
          Taro.showToast({ title: '头像已更新', icon: 'success' });
        }
      },
      fail: () => {
        console.log('[ProfileEdit] Choose image cancelled or failed');
      },
    });
  };

  const handleSubmit = async () => {
    console.log('[ProfileEdit] Handle submit');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await authService.updateProfile(formData as Partial<UserInfo>);

      updateUserInfo(formData as Partial<UserInfo>);

      console.log('[ProfileEdit] Submit success');

      await Taro.showModal({
        title: '保存成功',
        content: '您的个人信息已成功更新。',
        showCancel: false,
        confirmText: '我知道了',
      });

      Taro.navigateBack({ delta: 1 });
    } catch (err) {
      console.error('[ProfileEdit] Submit error:', err);
      Taro.showToast({
        title: err instanceof Error ? err.message : '保存失败，请稍后重试',
        icon: 'none',
        duration: 2500,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = useMemo(() => {
    return (
      formData.name.trim().length >= 2 &&
      formData.name.trim().length <= 20 &&
      /^1[3-9]\d{9}$/.test(formData.phone) &&
      formData.department &&
      formData.position &&
      Object.keys(errors).length === 0 &&
      !submitting
    );
  }, [formData, errors, submitting]);

  return (
    <View className={styles.page}>
      <NavBar title="个人账号信息" />
      <View className="pageContainer">
        <View className={styles.avatarSection} onClick={handleAvatarClick}>
          <View className={styles.avatarWrapper}>
            {formData.avatar ? (
              <Image src={formData.avatar} mode="aspectFill" />
            ) : (
              <Text className={styles.avatarPlaceholder}>
                {formData.name?.charAt(0) || '用'}
              </Text>
            )}
            <View className={styles.avatarEditIcon}>✎</View>
          </View>
          <Text className={styles.avatarEditHint}>点击头像可更换</Text>
        </View>

        <View className={styles.tipCard}>
          <Text className={styles.tipTitle}>温馨提示</Text>
          <Text className={styles.tipText}>
            请确保您的个人信息准确无误。姓名、部门、职位等信息将用于考勤记录和请假审批。
          </Text>
        </View>

        <View className={styles.formSection}>
          <View className={styles.formItem}>
            <Text className={classnames(styles.formLabel, styles.formLabelRequired)}>
              姓名
            </Text>
            <Input
              className={styles.formInput}
              placeholder="请输入姓名"
              value={formData.name}
              onInput={(e) => handleInputChange('name', e.detail.value)}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              maxlength={20}
            />
          </View>
          {errors.name && <Text className={styles.errorText}>{errors.name}</Text>}

          <View className={styles.formItem}>
            <Text className={classnames(styles.formLabel, styles.formLabelRequired)}>
              手机号
            </Text>
            <Input
              className={styles.formInput}
              type="number"
              placeholder="请输入手机号码"
              value={formData.phone}
              onInput={(e) => handleInputChange('phone', e.detail.value)}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField(null)}
              maxlength={11}
            />
          </View>
          {errors.phone && <Text className={styles.errorText}>{errors.phone}</Text>}

          <View className={styles.formItem}>
            <Text className={classnames(styles.formLabel, styles.formLabelRequired)}>
              所属部门
            </Text>
            <Picker
              mode="selector"
              range={departmentOptions}
              value={departmentOptions.indexOf(formData.department)}
              onChange={(e) => handleInputChange('department', departmentOptions[e.detail.value])}
            >
              <View style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <Text
                  className={classnames(
                    styles.formValue,
                    !formData.department && styles.formReadOnly
                  )}
                >
                  {formData.department || '请选择部门'}
                </Text>
                <Text className={styles.formArrow}>▾</Text>
              </View>
            </Picker>
          </View>
          {errors.department && <Text className={styles.errorText}>{errors.department}</Text>}

          <View className={styles.formItem}>
            <Text className={classnames(styles.formLabel, styles.formLabelRequired)}>
              职位
            </Text>
            <Picker
              mode="selector"
              range={positionOptions}
              value={positionOptions.indexOf(formData.position)}
              onChange={(e) => handleInputChange('position', positionOptions[e.detail.value])}
            >
              <View style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <Text
                  className={classnames(
                    styles.formValue,
                    !formData.position && styles.formReadOnly
                  )}
                >
                  {formData.position || '请选择职位'}
                </Text>
                <Text className={styles.formArrow}>▾</Text>
              </View>
            </Picker>
          </View>
          {errors.position && <Text className={styles.errorText}>{errors.position}</Text>}

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>工号</Text>
            <Text className={classnames(styles.formValue, styles.formReadOnly)}>
              {userInfo?.employeeNo || '-'}
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.submitBar}>
        <View
          className={classnames(styles.submitBtn, (!canSubmit || submitting) && styles.disabled)}
          onClick={canSubmit && !submitting ? handleSubmit : undefined}
        >
          {submitting ? '保存中...' : '保存修改'}
        </View>
      </View>

      {submitting && (
        <View className={styles.loadingOverlay}>
          <View className={styles.loadingContent}>
            <View className={styles.spinner} />
            <Text className={styles.loadingText}>正在保存...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default ProfileEditPage;
