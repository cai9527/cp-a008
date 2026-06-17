import React, { useState, useEffect } from 'react';
import { View, Text, Textarea, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useLocation } from '@/hooks/useLocation';
import { useCheckinStore } from '@/store/useCheckinStore';
import { checkinService } from '@/services/checkin';
import NavBar from '@/components/NavBar';
import LocationStatusCard from '@/components/LocationStatusCard';

const FieldCheckinPage: React.FC = () => {
  const {
    status: locationStatus,
    location,
    error: locationError,
    retryCount,
    timestamp,
    getLocation,
    retry,
    validateLocation,
    isLocating,
    isSuccess,
  } = useLocation();

  const { addRecord } = useCheckinStore();

  const [remark, setRemark] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  useDidShow(() => {
    if (!location) {
      getLocation();
    }
  });

  const handleRefreshLocation = () => {
    getLocation(true);
  };

  const handleTakePhoto = async () => {
    if (photos.length >= 3) {
      Taro.showToast({ title: '最多上传3张照片', icon: 'none' });
      return;
    }

    try {
      const res = await Taro.chooseImage({
        count: 3 - photos.length,
        sizeType: ['compressed'],
        sourceType: ['camera'],
      });
      setPhotos([...photos, ...res.tempFilePaths]);
      console.log('[FieldCheckin] Take photo:', res.tempFilePaths);
    } catch (err) {
      console.error('[FieldCheckin] Take photo error:', err);
      if (err instanceof Error && !err.message.includes('cancel')) {
        Taro.showToast({ title: '拍照失败，请重试', icon: 'none' });
      }
    }
  };

  const handleDeletePhoto = (index: number) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这张照片吗？删除后需要重新拍摄。',
      confirmText: '删除',
      confirmColor: '#F53F3F',
      success: (res) => {
        if (res.confirm) {
          setPhotos(photos.filter((_, i) => i !== index));
        }
      },
    });
  };

  const handleSubmit = async () => {
    console.log('[FieldCheckin] Handle submit, locationStatus:', locationStatus);

    if (!isSuccess || !location) {
      if (isLocating) {
        Taro.showToast({ title: '正在获取位置信息，请稍候...', icon: 'none' });
        return;
      }
      Taro.showToast({ title: '请先完成定位后再提交', icon: 'none' });
      await getLocation(true);
      return;
    }

    const validation = validateLocation(location);
    if (!validation.valid) {
      Taro.showModal({
        title: '位置验证失败',
        content: validation.reason || '当前位置不符合打卡要求',
        confirmText: '重新定位',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            getLocation(true);
          }
        },
      });
      return;
    }

    if (photos.length === 0) {
      Taro.showToast({ title: '请拍摄现场照片作为打卡凭证', icon: 'none' });
      return;
    }

    if (!remark || remark.trim().length < 5) {
      Taro.showToast({ title: '请填写外勤原因（至少5个字）', icon: 'none' });
      return;
    }

    setSubmitting(true);
    try {
      const record = await checkinService.doCheckin(
        'outing',
        location,
        remark.trim(),
        photos[0]
      );

      addRecord(record);

      Taro.showToast({ title: '外勤打卡成功', icon: 'success' });

      setTimeout(() => {
        Taro.navigateBack();
      }, 1000);

      console.log('[FieldCheckin] Submit success:', record);
    } catch (err) {
      console.error('[FieldCheckin] Submit error:', err);
      Taro.showToast({
        title: err instanceof Error ? err.message : '提交失败',
        icon: 'none',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = isSuccess && !!location && remark.trim().length >= 5 && photos.length > 0 && !submitting;

  return (
    <View className={styles.page}>
      <NavBar title="外勤打卡" />
      <View className="pageContainer">
        <View className={styles.tipCard}>
          <Text className={styles.tipTitle}>📋 外勤打卡说明</Text>
          <Text className={styles.tipText}>
            外勤打卡用于外出办公场景，需完成实时定位验证并拍摄现场照片作为打卡凭证。打卡记录将自动同步给管理员审核。
          </Text>
          <View className={styles.tipRequirements}>
            <Text className={styles.tipReqItem}>✓ 定位验证通过</Text>
            <Text className={styles.tipReqItem}>✓ 拍摄现场照片（必填）</Text>
            <Text className={styles.tipReqItem}>✓ 填写外勤原因</Text>
          </View>
        </View>

        <LocationStatusCard
          status={locationStatus}
          location={location}
          error={locationError}
          retryCount={retryCount}
          timestamp={timestamp}
          onRefresh={handleRefreshLocation}
          onRetry={retry}
        />

        <View className={styles.formCard}>
          <View className={styles.formItem}>
            <Text className={classnames(styles.formLabel, styles.formLabelRequired)}>
              外勤原因
            </Text>
            <Textarea
              className={styles.textarea}
              placeholder="请详细描述外勤原因，如：拜访客户、现场调试等..."
              maxlength={200}
              value={remark}
              onInput={(e) => setRemark(e.detail.value)}
              autoHeight
            />
            <Text className={styles.wordCount}>{remark.length}/200</Text>
          </View>
        </View>

        <View className={styles.photoSection}>
          <View className={styles.photoTitleRow}>
            <Text className={classnames(styles.photoTitle, styles.formLabelRequired)}>
              现场照片
            </Text>
            <Text className={styles.photoHint}>需现场拍摄，最多3张</Text>
          </View>
          <View className={styles.photoGrid}>
            {photos.map((photo, index) => (
              <View key={index} className={styles.photoItem}>
                <Image src={photo} mode="aspectFill" className={styles.photoImage} />
                <View className={styles.photoBadge}>
                  <Text className={styles.photoBadgeText}>现场</Text>
                </View>
                <View className={styles.photoDelete} onClick={() => handleDeletePhoto(index)}>
                  ×
                </View>
              </View>
            ))}
            {photos.length < 3 && (
              <View className={styles.photoAdd} onClick={handleTakePhoto}>
                <Text className={styles.photoAddIcon}>📷</Text>
                <Text className={styles.photoAddText}>拍摄现场照片</Text>
              </View>
            )}
          </View>
          {photos.length === 0 && (
            <View className={styles.photoWarning}>
              <Text className={styles.photoWarningText}>⚠️ 请拍摄现场照片，照片为外勤打卡必填凭证</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.submitBar}>
        <View
          className={classnames(styles.submitBtn, !canSubmit && styles.disabled)}
          onClick={canSubmit ? handleSubmit : undefined}
        >
          {submitting ? '提交中...' : isLocating ? '定位中...' : '提交外勤打卡'}
        </View>
        {!canSubmit && !submitting && (
          <Text className={styles.submitHint}>
            {!isSuccess ? '请先完成定位验证' : photos.length === 0 ? '请拍摄现场照片' : remark.trim().length < 5 ? '请填写外勤原因' : ''}
          </Text>
        )}
      </View>

      {submitting && (
        <View className={styles.loadingOverlay}>
          <View className={styles.loadingContent}>
            <View className={styles.spinner} />
            <Text className={styles.loadingText}>正在提交...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default FieldCheckinPage;
