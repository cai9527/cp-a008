import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Textarea, Image, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import classnames from 'classnames';
import styles from './index.module.scss';
import { leaveService } from '@/services/leave';
import { leaveTypeOptions, type LeaveType } from '@/types/leave';

const LeaveApplyPage: React.FC = () => {
  const [leaveType, setLeaveType] = useState<LeaveType>('annual');
  const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [reason, setReason] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [balance, setBalance] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const data = await leaveService.getBalance();
      setBalance(data);
    } catch (err) {
      console.error('[LeaveApply] Load balance error:', err);
    }
  };

  const days = useMemo(() => {
    const start = dayjs(`${startDate} ${startTime}`);
    const end = dayjs(`${endDate} ${endTime}`);
    const diffHours = end.diff(start, 'hour');
    if (diffHours <= 0) return 0;
    return Math.round((diffHours / 8) * 10) / 10;
  }, [startDate, endDate, startTime, endTime]);

  const handleStartDateChange = (e: any) => {
    const newDate = e.detail.value;
    setStartDate(newDate);
    if (dayjs(newDate).isAfter(dayjs(endDate))) {
      setEndDate(newDate);
    }
  };

  const handleEndDateChange = (e: any) => {
    const newDate = e.detail.value;
    if (dayjs(newDate).isBefore(dayjs(startDate))) {
      Taro.showToast({ title: '结束日期不能早于开始日期', icon: 'none' });
      return;
    }
    setEndDate(newDate);
  };

  const handleChooseImage = async () => {
    if (attachments.length >= 3) {
      Taro.showToast({ title: '最多上传3张附件', icon: 'none' });
      return;
    }

    try {
      const res = await Taro.chooseImage({
        count: 3 - attachments.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      });
      setAttachments([...attachments, ...res.tempFilePaths]);
      console.log('[LeaveApply] Choose images:', res.tempFilePaths);
    } catch (err) {
      console.error('[LeaveApply] Choose image error:', err);
    }
  };

  const handleDeleteAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    console.log('[LeaveApply] Handle submit');

    if (!leaveType) {
      Taro.showToast({ title: '请选择请假类型', icon: 'none' });
      return;
    }

    if (days <= 0) {
      Taro.showToast({ title: '请选择正确的时间范围', icon: 'none' });
      return;
    }

    if (!reason || reason.trim().length < 5) {
      Taro.showToast({ title: '请详细填写请假原因（至少5个字）', icon: 'none' });
      return;
    }

    const balanceDays = balance?.[leaveType] ?? 0;
    if (balanceDays > 0 && days > balanceDays) {
      const res = await Taro.showModal({
        title: '提示',
        content: `您的${leaveTypeOptions.find((t) => t.value === leaveType)?.label}余额为${balanceDays}天，是否继续提交？`,
        confirmText: '继续提交',
        cancelText: '返回修改',
      });
      if (!res.confirm) return;
    }

    setSubmitting(true);
    try {
      const record = await leaveService.apply({
        type: leaveType,
        startDate,
        endDate,
        startTime,
        endTime,
        reason: reason.trim(),
        attachmentUrl: attachments[0],
      });

      Taro.showToast({ title: '申请提交成功', icon: 'success' });

      setTimeout(() => {
        Taro.navigateBack();
      }, 1000);

      console.log('[LeaveApply] Submit success:', record);
    } catch (err) {
      console.error('[LeaveApply] Submit error:', err);
      Taro.showToast({
        title: err instanceof Error ? err.message : '提交失败',
        icon: 'none',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = leaveType && days > 0 && reason.trim().length >= 5;

  const minEndDate = startDate;

  return (
    <View className={styles.page}>
      <View className="pageContainer">
        <View className={styles.tipCard}>
          <Text className={styles.tipTitle}>📋 请假说明</Text>
          <Text className={styles.tipText}>
            请如实填写请假信息，提交后将由上级领导审批。审批通过前可撤销申请，审批通过后如需修改请联系管理员。
          </Text>
        </View>

        <View className={styles.formCard}>
          <View className={styles.formItem}>
            <Text className={classnames(styles.formLabel, styles.formLabelRequired)}>
              请假类型
            </Text>
            <View className={styles.typeGrid}>
              {leaveTypeOptions.map((option) => (
                <View
                  key={option.value}
                  className={classnames(styles.typeItem, leaveType === option.value && styles.active)}
                  onClick={() => setLeaveType(option.value)}
                >
                  {option.label}
                  {balance && balance[option.value] !== undefined && (
                    <Text style={{ fontSize: '20rpx', marginLeft: '8rpx', opacity: 0.7 }}>
                      ({balance[option.value]}天)
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={classnames(styles.formLabel, styles.formLabelRequired)}>
              开始日期
            </Text>
            <Picker mode="date" value={startDate} onChange={handleStartDateChange}>
              <View className={styles.datePicker}>
                <Text>{startDate}</Text>
                <Text className={styles.dateIcon}>📅</Text>
              </View>
            </Picker>
            <View className={styles.timeSection}>
              <Picker mode="time" value={startTime} onChange={(e) => setStartTime(e.detail.value)}>
                <View className={styles.timePicker}>
                  {startTime}
                </View>
              </Picker>
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={classnames(styles.formLabel, styles.formLabelRequired)}>
              结束日期
            </Text>
            <Picker
              mode="date"
              value={endDate}
              start={minEndDate}
              onChange={handleEndDateChange}
            >
              <View className={styles.datePicker}>
                <Text>{endDate}</Text>
                <Text className={styles.dateIcon}>📅</Text>
              </View>
            </Picker>
            <View className={styles.timeSection}>
              <Picker mode="time" value={endTime} onChange={(e) => setEndTime(e.detail.value)}>
                <View className={styles.timePicker}>
                  {endTime}
                </View>
              </Picker>
            </View>
          </View>

          {days > 0 && (
            <View className={styles.daysCount}>
              <Text className={styles.daysCountText}>共计请假</Text>
              <View>
                <Text className={styles.daysCountValue}>{days}</Text>
                <Text className={styles.daysCountUnit}>天</Text>
              </View>
            </View>
          )}
        </View>

        <View className={styles.formCard}>
          <View className={styles.formItem}>
            <Text className={classnames(styles.formLabel, styles.formLabelRequired)}>
              请假原因
            </Text>
            <Textarea
              className={styles.textarea}
              placeholder="请详细描述请假原因，如：身体不适需就医、家中有事需处理等..."
              maxlength={500}
              value={reason}
              onInput={(e) => setReason(e.detail.value)}
              autoHeight
            />
            <Text className={styles.wordCount}>{reason.length}/500</Text>
          </View>
        </View>

        <View className={styles.attachmentSection}>
          <Text className={styles.attachmentTitle}>
            相关证明（可选，最多3张）
          </Text>
          <View className={styles.attachmentGrid}>
            {attachments.map((attachment, index) => (
              <View key={index} className={styles.attachmentItem}>
                <Image src={attachment} mode="aspectFill" />
                <View
                  className={styles.attachmentDelete}
                  onClick={() => handleDeleteAttachment(index)}
                >
                  ×
                </View>
              </View>
            ))}
            {attachments.length < 3 && (
              <View className={styles.attachmentAdd} onClick={handleChooseImage}>
                <Text className={styles.attachmentAddIcon}>+</Text>
                <Text className={styles.attachmentAddText}>添加附件</Text>
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
          {submitting ? '提交中...' : '提交申请'}
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

export default LeaveApplyPage;
