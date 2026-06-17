import React, { useState, useEffect } from 'react';
import { View, Text, Textarea, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useLocation } from '@/hooks/useLocation';
import { useCheckinStore } from '@/store/useCheckinStore';
import { checkinService } from '@/services/checkin';

const FieldCheckinPage: React.FC = () => {
  const { location, loading: locationLoading, getLocation } = useLocation();
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
    getLocation();
  };

  const handleChooseImage = async () => {
    if (photos.length >= 3) {
      Taro.showToast({ title: '最多上传3张照片', icon: 'none' });
      return;
    }

    try {
      const res = await Taro.chooseImage({
        count: 3 - photos.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      });
      setPhotos([...photos, ...res.tempFilePaths]);
      console.log('[FieldCheckin] Choose images:', res.tempFilePaths);
    } catch (err) {
      console.error('[FieldCheckin] Choose image error:', err);
    }
  };

  const handleDeletePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    console.log('[FieldCheckin] Handle submit');

    if (!location) {
      Taro.showToast({ title: '正在获取位置信息...', icon: 'none' });
      await getLocation();
      return;
    }

    if (!remark || remark.trim().length < 5) {
      Taro.showToast({ title: '请填写外勤原因（至少5个字）', icon: 'none' });
      return;
    }

    if (photos.length === 0) {
      const res = await Taro.showModal({
        title: '提示',
        content: '建议上传现场照片，是否继续提交？',
        confirmText: '继续提交',
        cancelText: '去上传',
      });
      if (!res.confirm) return;
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

  const canSubmit = location && remark.trim().length >= 5;

  return (
    <View className={styles.page}>
      <View className="pageContainer">
        <View className={styles.tipCard}>
          <Text className={styles.tipTitle}>📋 外勤打卡说明</Text>
          <Text className={styles.tipText}>
            外勤打卡用于外出办公场景，请如实填写外勤原因并上传现场照片。打卡记录将自动同步给管理员审核。
          </Text>
        </View>

        <View className={styles.locationCard}>
          <Text className={styles.locationTitle}>当前位置</Text>
          <View className={styles.locationInfo}>
            <View className={styles.locationIcon}>📍</View>
            <View className={styles.locationText}>
              <Text className={styles.locationAddress}>
                {locationLoading ? '定位中...' : location?.address || '获取位置失败'}
              </Text>
              {location && (
                <>
                  <Text className={styles.locationDetail}>
                    精度：{location.accuracy.toFixed(0)}米
                  </Text>
                  {location.wifiName && (
                    <Text className={styles.locationDetail}>
                      WiFi：{location.wifiName}
                    </Text>
                  )}
                </>
              )}
            </View>
            <View className={styles.refreshBtn} onClick={handleRefreshLocation}>
              刷新
            </View>
          </View>
        </View>

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
          <Text className={styles.photoTitle}>现场照片（可选，最多3张）</Text>
          <View className={styles.photoGrid}>
            {photos.map((photo, index) => (
              <View key={index} className={styles.photoItem}>
                <Image src={photo} mode="aspectFill" />
                <View className={styles.photoDelete} onClick={() => handleDeletePhoto(index)}>
                  ×
                </View>
              </View>
            ))}
            {photos.length < 3 && (
              <View className={styles.photoAdd} onClick={handleChooseImage}>
                <Text className={styles.photoAddIcon}>+</Text>
                <Text className={styles.photoAddText}>添加照片</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View className={styles.submitBar}>
        <View
          className={classnames(styles.submitBtn, (!canSubmit || submitting) && styles.disabled)}
          onClick={canSubmit && !submitting ? handleSubmit : undefined}
        >
          {submitting ? '提交中...' : '提交外勤打卡'}
        </View>
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
