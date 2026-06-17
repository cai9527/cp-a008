import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import NavBar from '@/components/NavBar';
import { guideList } from '@/data/helpCenter';
import type { GuideItem } from '@/types/help';

const HelpGuideDetailPage: React.FC = () => {
  const router = useRouter();
  const guideId = router.params.id;

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState(0);

  const currentGuide = useMemo(() => {
    return guideList.find((item) => item.id === guideId) || null;
  }, [guideId]);

  const relatedGuides = useMemo(() => {
    if (!currentGuide) return [];
    return guideList
      .filter(
        (item) => item.category === currentGuide.category && item.id !== currentGuide.id
      )
      .slice(0, 3);
  }, [currentGuide]);

  useEffect(() => {
    if (currentGuide) {
      const saved = Taro.getStorageSync(`guide_${currentGuide.id}`);
      if (saved) {
        setCompletedSteps(JSON.parse(saved));
      }
    }
  }, [currentGuide]);

  const getDifficultyLabel = (difficulty: string) => {
    const map: Record<string, string> = {
      beginner: '入门',
      intermediate: '进阶',
      advanced: '高级',
    };
    return map[difficulty] || difficulty;
  };

  const handleStepComplete = (stepNum: number) => {
    console.log('[GuideDetail] Toggle step complete:', stepNum);
    let newCompleted: number[];
    if (completedSteps.includes(stepNum)) {
      newCompleted = completedSteps.filter((s) => s !== stepNum);
    } else {
      newCompleted = [...completedSteps, stepNum];
    }
    setCompletedSteps(newCompleted);
    if (currentGuide) {
      Taro.setStorageSync(`guide_${currentGuide.id}`, JSON.stringify(newCompleted));
    }

    if (!completedSteps.includes(stepNum)) {
      Taro.showToast({
        title: '已标记为完成',
        icon: 'success',
        duration: 1500,
      });
    }
  };

  const handleGuideClick = (guide: GuideItem) => {
    Taro.redirectTo({
      url: `/pages/help-guide-detail/index?id=${guide.id}`,
    });
  };

  const handleGoBack = () => {
    Taro.navigateBack();
  };

  const handleShare = () => {
    console.log('[GuideDetail] Share guide');
    Taro.showToast({
      title: '分享功能开发中',
      icon: 'none',
      duration: 2000,
    });
  };

  const handleResetProgress = () => {
    console.log('[GuideDetail] Reset progress');
    Taro.showModal({
      title: '重置进度',
      content: '确定要重置本指南的学习进度吗？',
      success: (res) => {
        if (res.confirm) {
          setCompletedSteps([]);
          setActiveStep(0);
          if (currentGuide) {
            Taro.removeStorageSync(`guide_${currentGuide.id}`);
          }
          Taro.showToast({
            title: '进度已重置',
            icon: 'success',
            duration: 2000,
          });
        }
      },
    });
  };

  if (!currentGuide) {
    return (
      <View className={styles.page}>
        <NavBar title="指南详情" onBack={handleGoBack} />
        <View className={styles.pageContainer}>
          <View className={styles.emptyState}>
            <Text className={styles.emptyState_icon}>📚</Text>
            <Text className={styles.emptyState_text}>指南不存在或已被删除</Text>
            <View className={styles.emptyState_btn} onClick={handleGoBack}>
              返回列表
            </View>
          </View>
        </View>
      </View>
    );
  }

  const totalSteps = currentGuide.steps.length;
  const progress = totalSteps > 0 ? Math.round((completedSteps.length / totalSteps) * 100) : 0;

  return (
    <View className={styles.page}>
      <NavBar title="指南详情" onBack={handleGoBack} />
      <View className={styles.pageContainer}>
        <View className={styles.cover}>
          <Image
            className={styles.cover_image}
            src={currentGuide.coverImage}
            mode="aspectFill"
          />
          <View className={styles.cover_overlay}>
            <Text className={styles.cover_title}>{currentGuide.title}</Text>
            <View className={styles.cover_meta}>
              <Text
                className={classnames(
                  styles.cover_difficulty,
                  styles[`cover_difficulty${currentGuide.difficulty.charAt(0).toUpperCase() + currentGuide.difficulty.slice(1)}`]
                )}
              >
                {getDifficultyLabel(currentGuide.difficulty)}
              </Text>
              <Text className={styles.cover_time}>⏱ {currentGuide.estimatedTime}</Text>
              <Text className={styles.cover_updatedAt}>📅 更新于 {currentGuide.updatedAt}</Text>
            </View>
          </View>
        </View>

        {totalSteps > 0 && (
          <View className={styles.progressSection}>
            <View className={styles.progressSection_header}>
              <Text className={styles.progressSection_title}>学习进度</Text>
              <Text className={styles.progressSection_percent}>{progress}%</Text>
            </View>
            <View className={styles.progressSection_track}>
              <View
                className={styles.progressSection_fill}
                style={{ width: `${progress}%` }}
              />
            </View>
            <View className={styles.progressSection_steps}>
              {currentGuide.steps.map((step) => (
                <View
                  key={step.step}
                  className={classnames(
                    styles.progressSection_step,
                    completedSteps.includes(step.step) && styles.progressSection_stepCompleted,
                    activeStep === step.step && styles.progressSection_stepActive
                  )}
                />
              ))}
            </View>
          </View>
        )}

        <View className={styles.guideInfo}>
          <Text className={styles.guideInfo_desc}>{currentGuide.content}</Text>
          <View className={styles.guideInfo_infoGrid}>
            <View className={styles.guideInfo_infoItem}>
              <Text className={styles.guideInfo_infoIcon}>📊</Text>
              <Text className={styles.guideInfo_infoLabel}>难度等级</Text>
              <Text className={styles.guideInfo_infoValue}>
                {getDifficultyLabel(currentGuide.difficulty)}
              </Text>
            </View>
            <View className={styles.guideInfo_infoItem}>
              <Text className={styles.guideInfo_infoIcon}>⏱️</Text>
              <Text className={styles.guideInfo_infoLabel}>预计时间</Text>
              <Text className={styles.guideInfo_infoValue}>
                {currentGuide.estimatedTime}
              </Text>
            </View>
            <View className={styles.guideInfo_infoItem}>
              <Text className={styles.guideInfo_infoIcon}>📝</Text>
              <Text className={styles.guideInfo_infoLabel}>学习步骤</Text>
              <Text className={styles.guideInfo_infoValue}>{totalSteps}步</Text>
            </View>
          </View>
        </View>

        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionTitle_icon}>📋</Text>
          操作步骤
        </Text>
        <View className={styles.stepsSection}>
          {currentGuide.steps.map((step) => (
            <View
              key={step.step}
              className={styles.stepItem}
              onClick={() => setActiveStep(step.step)}
            >
              <View
                className={styles.stepItem_stepNum}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStepComplete(step.step);
                }}
              >
                {completedSteps.includes(step.step) ? '✓' : step.step}
              </View>
              <View className={styles.stepItem_content}>
                <Text className={styles.stepItem_title}>{step.title}</Text>
                <Text className={styles.stepItem_desc}>{step.description}</Text>
                {step.tips && step.tips.length > 0 && (
                  <View className={styles.stepItem_tips}>
                    <Text className={styles.stepItem_tips_tipsTitle}>
                      <Text className={styles.stepItem_tips_tipsTitle_icon}>💡</Text>
                      小贴士
                    </Text>
                    <View className={styles.stepItem_tips_tipsList}>
                      {step.tips.map((tip, i) => (
                        <Text key={i} className={styles.stepItem_tips_tipsItem}>
                          {tip}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {relatedGuides.length > 0 && (
          <View className={styles.relatedGuides}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionTitle_icon}>🔗</Text>
              相关指南
            </Text>
            <View className={styles.relatedGuides_list}>
              {relatedGuides.map((guide) => (
                <View
                  key={guide.id}
                  className={styles.relatedGuides_item}
                  onClick={() => handleGuideClick(guide)}
                >
                  <View className={styles.relatedGuides_cover}>
                    <Image
                      className={styles.relatedGuides_coverImage}
                      src={guide.coverImage}
                      mode="aspectFill"
                    />
                  </View>
                  <View className={styles.relatedGuides_content}>
                    <Text className={styles.relatedGuides_title}>{guide.title}</Text>
                    <Text className={styles.relatedGuides_desc}>{guide.description}</Text>
                    <View className={styles.relatedGuides_meta}>
                      <Text
                        className={classnames(
                          styles.relatedGuides_difficulty,
                          styles[`relatedGuides_difficulty${guide.difficulty.charAt(0).toUpperCase() + guide.difficulty.slice(1)}`]
                        )}
                      >
                        {getDifficultyLabel(guide.difficulty)}
                      </Text>
                      <Text className={styles.relatedGuides_time}>⏱ {guide.estimatedTime}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View className={styles.actionBar}>
        <View
          className={classnames(styles.actionBar_btn, styles.actionBar_btnSecondary)}
          onClick={handleResetProgress}
        >
          <Text className={styles.actionBar_btn_icon}>🔄</Text>
          重置进度
        </View>
        <View
          className={classnames(styles.actionBar_btn, styles.actionBar_btnPrimary)}
          onClick={handleShare}
        >
          <Text className={styles.actionBar_btn_icon}>📤</Text>
          分享指南
        </View>
      </View>
    </View>
  );
};

export default HelpGuideDetailPage;
