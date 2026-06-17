import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import NavBar from '@/components/NavBar';
import { faqList } from '@/data/helpCenter';
import type { FAQItem } from '@/types/help';

const HelpFaqDetailPage: React.FC = () => {
  const router = useRouter();
  const faqId = router.params.id;

  const [helpfulStatus, setHelpfulStatus] = useState<'yes' | 'no' | null>(null);
  const [yesCount, setYesCount] = useState(0);
  const [noCount, setNoCount] = useState(0);

  const currentFaq = useMemo(() => {
    return faqList.find((item) => item.id === faqId) || null;
  }, [faqId]);

  const relatedFaqs = useMemo(() => {
    if (!currentFaq) return [];
    return faqList
      .filter(
        (item) => item.category === currentFaq.category && item.id !== currentFaq.id
      )
      .slice(0, 5);
  }, [currentFaq]);

  const getCategoryLabel = (category: string) => {
    const map: Record<string, string> = {
      checkin: '打卡考勤',
      leave: '请假管理',
      account: '账号安全',
      system: '系统设置',
      other: '其他问题',
    };
    return map[category] || category;
  };

  const handleHelpfulClick = (type: 'yes' | 'no') => {
    console.log('[FaqDetail] Click helpful:', type);
    if (helpfulStatus === type) {
      setHelpfulStatus(null);
      if (type === 'yes') {
        setYesCount((prev) => prev - 1);
      } else {
        setNoCount((prev) => prev - 1);
      }
    } else {
      if (helpfulStatus === 'yes') {
        setYesCount((prev) => prev - 1);
      } else if (helpfulStatus === 'no') {
        setNoCount((prev) => prev - 1);
      }
      setHelpfulStatus(type);
      if (type === 'yes') {
        setYesCount((prev) => prev + 1);
        Taro.showToast({
          title: '感谢您的反馈',
          icon: 'success',
          duration: 2000,
        });
      } else {
        setNoCount((prev) => prev + 1);
      }
    }
  };

  const handleFaqClick = (faq: FAQItem) => {
    Taro.redirectTo({
      url: `/pages/help-faq-detail/index?id=${faq.id}`,
    });
  };

  const handleContactSupport = () => {
    Taro.navigateTo({
      url: '/pages/help-center/index?tab=contact',
    });
  };

  const handleGoBack = () => {
    Taro.navigateBack();
  };

  if (!currentFaq) {
    return (
      <View className={styles.page}>
        <NavBar title="问题详情" onBack={handleGoBack} />
        <View className={styles.pageContainer}>
          <View className={styles.emptyState}>
            <Text className={styles.emptyState_icon}>😕</Text>
            <Text className={styles.emptyState_text}>问题不存在或已被删除</Text>
            <View className={styles.emptyState_btn} onClick={handleGoBack}>
              返回列表
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <NavBar title="问题详情" onBack={handleGoBack} />
      <View className={styles.pageContainer}>
        <View className={styles.faqHeader}>
          <Text className={styles.faqHeader_question}>{currentFaq.question}</Text>
          <View className={styles.faqHeader_meta}>
            {currentFaq.tags.map((tag, i) => (
              <Text key={i} className={styles.faqHeader_tag}>
                #{tag}
              </Text>
            ))}
            <Text className={styles.faqHeader_views}>
              👁️ {currentFaq.views + yesCount}次浏览
            </Text>
            <Text className={styles.faqHeader_date}>📅 {currentFaq.createdAt}</Text>
          </View>
        </View>

        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionTitle_icon}>📝</Text>
          问题解答
        </Text>
        <View className={styles.answerSection}>
          <Text className={styles.answerSection_content}>{currentFaq.answer}</Text>
        </View>

        <View className={styles.helpfulSection}>
          <Text className={styles.helpfulSection_question}>
            这个回答对您有帮助吗？
          </Text>
          <View className={styles.helpfulSection_btnGroup}>
            <View
              className={classnames(
                styles.helpfulSection_btn,
                helpfulStatus === 'yes' && styles.helpfulSection_btnActive
              )}
              onClick={() => handleHelpfulClick('yes')}
            >
              <Text className={styles.helpfulSection_btnIcon}>👍</Text>
              <Text className={styles.helpfulSection_btnText}>有帮助</Text>
              <Text className={styles.helpfulSection_count}>{yesCount}人觉得有用</Text>
            </View>
            <View
              className={classnames(
                styles.helpfulSection_btn,
                helpfulStatus === 'no' && styles.helpfulSection_btnActive
              )}
              onClick={() => handleHelpfulClick('no')}
            >
              <Text className={styles.helpfulSection_btnIcon}>👎</Text>
              <Text className={styles.helpfulSection_btnText}>没帮助</Text>
              <Text className={styles.helpfulSection_count}>{noCount}人觉得没用</Text>
            </View>
          </View>
        </View>

        {relatedFaqs.length > 0 && (
          <View className={styles.relatedFaq}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionTitle_icon}>🔗</Text>
              相关问题
            </Text>
            <View className={styles.relatedFaq_list}>
              {relatedFaqs.map((faq) => (
                <View
                  key={faq.id}
                  className={styles.relatedFaq_item}
                  onClick={() => handleFaqClick(faq)}
                >
                  <Text className={styles.relatedFaq_qText}>{faq.question}</Text>
                  <View className={styles.relatedFaq_qMeta}>
                    <Text className={styles.relatedFaq_qCategory}>
                      {getCategoryLabel(faq.category)}
                    </Text>
                    <Text className={styles.relatedFaq_qViews}>
                      {faq.views}次浏览
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className={styles.contactBanner}>
          <Text className={styles.contactBanner_title}>没有找到您需要的答案？</Text>
          <Text className={styles.contactBanner_desc}>
            联系我们的技术支持团队，我们会尽快为您解答
          </Text>
          <View className={styles.contactBanner_btn} onClick={handleContactSupport}>
            联系支持
          </View>
        </View>
      </View>
    </View>
  );
};

export default HelpFaqDetailPage;
