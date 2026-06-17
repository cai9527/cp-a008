import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView, Image, Picker, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import NavBar from '@/components/NavBar';
import { faqCategories, guideCategories, faqList, guideList } from '@/data/helpCenter';
import type { FAQItem, GuideItem, ContactFormData } from '@/types/help';

const tabs = [
  { id: 'faq', name: '常见问题', icon: '❓' },
  { id: 'guide', name: '操作指南', icon: '📖' },
  { id: 'contact', name: '联系支持', icon: '📞' },
];

const questionTypes = [
  '功能咨询',
  'Bug反馈',
  '账号问题',
  '权限申请',
  '系统故障',
  '其他问题',
];

const HelpCenterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeFaqCategory, setActiveFaqCategory] = useState('all');
  const [activeGuideCategory, setActiveGuideCategory] = useState('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    phone: '',
    email: '',
    type: '',
    title: '',
    content: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const hotFaqs = useMemo(() => {
    return [...faqList].sort((a, b) => b.views - a.views).slice(0, 5);
  }, []);

  const filteredFaqs = useMemo(() => {
    let list = faqList;
    if (activeFaqCategory !== 'all') {
      list = list.filter((item) => item.category === activeFaqCategory);
    }
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      list = list.filter(
        (item) =>
          item.question.toLowerCase().includes(keyword) ||
          item.answer.toLowerCase().includes(keyword) ||
          item.tags.some((tag) => tag.toLowerCase().includes(keyword))
      );
    }
    return list;
  }, [activeFaqCategory, searchKeyword]);

  const filteredGuides = useMemo(() => {
    let list = guideList;
    if (activeGuideCategory !== 'all') {
      list = list.filter((item) => item.category === activeGuideCategory);
    }
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(keyword) ||
          item.description.toLowerCase().includes(keyword) ||
          item.content.toLowerCase().includes(keyword)
      );
    }
    return list;
  }, [activeGuideCategory, searchKeyword]);

  const getDifficultyLabel = (difficulty: string) => {
    const map: Record<string, string> = {
      beginner: '入门',
      intermediate: '进阶',
      advanced: '高级',
    };
    return map[difficulty] || difficulty;
  };

  const handleFaqClick = (faq: FAQItem) => {
    if (expandedFaqId === faq.id) {
      setExpandedFaqId(null);
    } else {
      setExpandedFaqId(faq.id);
    }
  };

  const handleViewFaqDetail = (faq: FAQItem) => {
    Taro.navigateTo({
      url: `/pages/help-faq-detail/index?id=${faq.id}`,
    });
  };

  const handleGuideClick = (guide: GuideItem) => {
    Taro.navigateTo({
      url: `/pages/help-guide-detail/index?id=${guide.id}`,
    });
  };

  const handleHotFaqClick = (faq: FAQItem) => {
    setActiveFaqCategory(faq.category);
    setExpandedFaqId(faq.id);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入您的姓名';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '请输入联系电话';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入正确的手机号码';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入正确的邮箱地址';
    }

    if (!formData.type) {
      newErrors.type = '请选择问题类型';
    }

    if (!formData.title.trim()) {
      newErrors.title = '请输入问题标题';
    } else if (formData.title.length < 5) {
      newErrors.title = '问题标题至少5个字符';
    }

    if (!formData.content.trim()) {
      newErrors.content = '请输入问题描述';
    } else if (formData.content.length < 20) {
      newErrors.content = '问题描述至少20个字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log('[HelpCenter] Submit contact form');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log('[HelpCenter] Form submitted successfully');

      await Taro.showModal({
        title: '提交成功',
        content: '感谢您的反馈，我们会在24小时内与您联系。',
        showCancel: false,
        confirmText: '我知道了',
      });

      setFormData({
        name: '',
        phone: '',
        email: '',
        type: '',
        title: '',
        content: '',
      });
    } catch (err) {
      console.error('[HelpCenter] Submit error:', err);
      Taro.showToast({
        title: '提交失败，请稍后重试',
        icon: 'none',
        duration: 2500,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const canSubmit =
    formData.name.trim() &&
    formData.phone.trim() &&
    formData.type &&
    formData.title.trim() &&
    formData.content.trim() &&
    Object.keys(errors).length === 0 &&
    !submitting;

  return (
    <View className={styles.page}>
      <NavBar title="帮助中心" />
      <ScrollView className={styles.pageContainer} scrollY>
        <View className={styles.tabBar}>
          {tabs.map((tab) => (
            <View
              key={tab.id}
              className={classnames(styles.tabBar_tab, activeTab === tab.id && styles.tabBar_tabActive)}
              onClick={() => setActiveTab(tab.id)}
            >
              <Text>{tab.icon}</Text>
              <Text style={{ marginLeft: '8rpx' }}>{tab.name}</Text>
            </View>
          ))}
        </View>

        {activeTab === 'faq' && (
          <>
            <View className={styles.searchBar}>
              <Text className={styles.searchBar_searchIcon}>🔍</Text>
              <Input
                className={styles.searchBar_input}
                placeholder="搜索常见问题"
                placeholderClass={styles.searchBar_placeholder}
                value={searchKeyword}
                onInput={(e) => setSearchKeyword(e.detail.value)}
              />
              {searchKeyword && (
                <Text
                  className={styles.searchBar_clearBtn}
                  onClick={() => setSearchKeyword('')}
                >
                  ✕
                </Text>
              )}
            </View>

            <ScrollView className={styles.categoryScroll} scrollX>
              {faqCategories.map((cat) => (
                <View
                  key={cat.id}
                  className={classnames(
                    styles.categoryItem,
                    activeFaqCategory === cat.id && styles.categoryItemActive
                  )}
                  onClick={() => setActiveFaqCategory(cat.id)}
                >
                  <Text className={styles.categoryItem_categoryIcon}>{cat.icon}</Text>
                  <Text className={styles.categoryItem_categoryName}>{cat.name}</Text>
                  <Text className={styles.categoryItem_categoryCount}>{cat.count}条</Text>
                </View>
              ))}
            </ScrollView>

            {!searchKeyword && activeFaqCategory === 'all' && (
              <>
                <Text className={styles.sectionTitle}>
                  <Text className={styles.sectionTitleIcon}>🔥</Text>
                  热门问题
                </Text>
                <View className={styles.hotList}>
                  {hotFaqs.map((faq, index) => (
                    <View
                      key={faq.id}
                      className={styles.hotList_hotItem}
                      onClick={() => handleHotFaqClick(faq)}
                    >
                      <Text
                        className={classnames(
                          styles.hotList_rank,
                          index < 3 && styles.hotList_rankTop
                        )}
                      >
                        {index + 1}
                      </Text>
                      <Text className={styles.hotList_qText}>{faq.question}</Text>
                      <Text className={styles.hotList_views}>{faq.views}次浏览</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionTitleIcon}>📋</Text>
              全部问题
            </Text>

            {filteredFaqs.length > 0 ? (
              <View className={styles.faqList}>
                {filteredFaqs.map((faq) => (
                  <View key={faq.id} className={styles.faqItem}>
                    <View
                      className={styles.faqItem_question}
                      onClick={() => handleFaqClick(faq)}
                    >
                      <Text className={styles.faqItem_qText}>{faq.question}</Text>
                      <Text
                        className={classnames(
                          styles.faqItem_qArrow,
                          expandedFaqId === faq.id && styles.faqItem_qArrowExpanded
                        )}
                      >
                        ▾
                      </Text>
                    </View>
                    <View className={styles.faqItem_qMeta}>
                      {faq.tags.slice(0, 2).map((tag, i) => (
                        <Text key={i} className={styles.faqItem_qTag}>
                          #{tag}
                        </Text>
                      ))}
                      <Text className={styles.faqItem_qViews}>{faq.views}次浏览</Text>
                    </View>
                    <View
                      className={classnames(
                        styles.faqItem_answer,
                        expandedFaqId === faq.id && styles.faqItem_answerExpanded
                      )}
                    >
                      <Text className={styles.faqItem_answerContent}>{faq.answer}</Text>
                      <Text
                        className={styles.faqItem_viewDetail}
                        onClick={() => handleViewFaqDetail(faq)}
                      >
                        查看详情
                        <Text className={styles.faqItem_viewDetail_arrow}>›</Text>
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className={styles.emptyState}>
                <Text className={styles.emptyState_icon}>🔍</Text>
                <Text className={styles.emptyState_text}>暂无相关问题</Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'guide' && (
          <>
            <View className={styles.searchBar}>
              <Text className={styles.searchBar_searchIcon}>🔍</Text>
              <Input
                className={styles.searchBar_input}
                placeholder="搜索操作指南"
                placeholderClass={styles.searchBar_placeholder}
                value={searchKeyword}
                onInput={(e) => setSearchKeyword(e.detail.value)}
              />
              {searchKeyword && (
                <Text
                  className={styles.searchBar_clearBtn}
                  onClick={() => setSearchKeyword('')}
                >
                  ✕
                </Text>
              )}
            </View>

            <ScrollView className={styles.categoryScroll} scrollX>
              {guideCategories.map((cat) => (
                <View
                  key={cat.id}
                  className={classnames(
                    styles.categoryItem,
                    activeGuideCategory === cat.id && styles.categoryItemActive
                  )}
                  onClick={() => setActiveGuideCategory(cat.id)}
                >
                  <Text className={styles.categoryItem_categoryIcon}>{cat.icon}</Text>
                  <Text className={styles.categoryItem_categoryName}>{cat.name}</Text>
                  <Text className={styles.categoryItem_categoryCount}>{cat.count}篇</Text>
                </View>
              ))}
            </ScrollView>

            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionTitleIcon}>📚</Text>
              全部指南
            </Text>
            <Text className={styles.sectionSubtitle}>
              从入门到精通，帮助您快速掌握系统的各项功能
            </Text>

            {filteredGuides.length > 0 ? (
              <View className={styles.guideList}>
                {filteredGuides.map((guide) => (
                  <View
                    key={guide.id}
                    className={styles.guideItem}
                    onClick={() => handleGuideClick(guide)}
                  >
                    <View className={styles.guideItem_cover}>
                      <Image
                        className={styles.guideItem_coverImage}
                        src={guide.coverImage}
                        mode="aspectFill"
                      />
                    </View>
                    <View className={styles.guideItem_content}>
                      <View>
                        <Text className={styles.guideItem_title}>{guide.title}</Text>
                        <Text className={styles.guideItem_desc}>{guide.description}</Text>
                      </View>
                      <View className={styles.guideItem_meta}>
                        <Text
                          className={classnames(
                            styles.guideItem_difficulty,
                            styles[`guideItem_difficulty${guide.difficulty.charAt(0).toUpperCase() + guide.difficulty.slice(1)}`]
                          )}
                        >
                          {getDifficultyLabel(guide.difficulty)}
                        </Text>
                        <Text className={styles.guideItem_time}>⏱ {guide.estimatedTime}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className={styles.emptyState}>
                <Text className={styles.emptyState_icon}>📚</Text>
                <Text className={styles.emptyState_text}>暂无相关指南</Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'contact' && (
          <>
            <View className={styles.formSection}>
              <Text className={styles.formSection_sectionTitle}>
                <Text className={styles.formSection_sectionTitle_icon}>📝</Text>
                提交问题
              </Text>

              <View className={styles.formItem}>
                <Text className={styles.formItem_label}>
                  <Text className={styles.formItem_labelRequired}>*</Text>
                  姓名
                </Text>
                <Input
                  className={classnames(
                    styles.formItem_input,
                    focusedField === 'name' && styles.formItem_inputFocused,
                    errors.name && styles.formItem_error
                  )}
                  placeholder="请输入您的姓名"
                  value={formData.name}
                  onInput={(e) => handleInputChange('name', e.detail.value)}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
                {errors.name && <Text className={styles.formItem_errorText}>{errors.name}</Text>}
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formItem_label}>
                  <Text className={styles.formItem_labelRequired}>*</Text>
                  联系电话
                </Text>
                <Input
                  className={classnames(
                    styles.formItem_input,
                    focusedField === 'phone' && styles.formItem_inputFocused,
                    errors.phone && styles.formItem_error
                  )}
                  placeholder="请输入手机号码"
                  type="number"
                  value={formData.phone}
                  onInput={(e) => handleInputChange('phone', e.detail.value)}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                />
                {errors.phone && <Text className={styles.formItem_errorText}>{errors.phone}</Text>}
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formItem_label}>邮箱（选填）</Text>
                <Input
                  className={classnames(
                    styles.formItem_input,
                    focusedField === 'email' && styles.formItem_inputFocused,
                    errors.email && styles.formItem_error
                  )}
                  placeholder="请输入邮箱地址"
                  value={formData.email}
                  onInput={(e) => handleInputChange('email', e.detail.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
                {errors.email && <Text className={styles.formItem_errorText}>{errors.email}</Text>}
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formItem_label}>
                  <Text className={styles.formItem_labelRequired}>*</Text>
                  问题类型
                </Text>
                <Picker
                  mode="selector"
                  range={questionTypes}
                  value={formData.type ? questionTypes.indexOf(formData.type) : 0}
                  onChange={(e) => handleInputChange('type', questionTypes[e.detail.value])}
                >
                  <View
                    className={classnames(
                      styles.formItem_picker,
                      errors.type && styles.formItem_error
                    )}
                  >
                    <Text className={formData.type ? '' : styles.formItem_placeholder}>
                      {formData.type || '请选择问题类型'}
                    </Text>
                    <Text style={{ color: '#86909C' }}>▾</Text>
                  </View>
                </Picker>
                {errors.type && <Text className={styles.formItem_errorText}>{errors.type}</Text>}
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formItem_label}>
                  <Text className={styles.formItem_labelRequired}>*</Text>
                  问题标题
                </Text>
                <Input
                  className={classnames(
                    styles.formItem_input,
                    focusedField === 'title' && styles.formItem_inputFocused,
                    errors.title && styles.formItem_error
                  )}
                  placeholder="请简要描述您遇到的问题"
                  value={formData.title}
                  onInput={(e) => handleInputChange('title', e.detail.value)}
                  onFocus={() => setFocusedField('title')}
                  onBlur={() => setFocusedField(null)}
                  maxlength={50}
                />
                {errors.title && <Text className={styles.formItem_errorText}>{errors.title}</Text>}
                <Text className={styles.formItem_charCount}>{formData.title.length}/50</Text>
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formItem_label}>
                  <Text className={styles.formItem_labelRequired}>*</Text>
                  问题描述
                </Text>
                <Textarea
                  className={classnames(
                    styles.formItem_textarea,
                    focusedField === 'content' && styles.formItem_textareaFocused,
                    errors.content && styles.formItem_error
                  )}
                  placeholder="请详细描述您遇到的问题，包括操作步骤、错误提示、期望结果等"
                  value={formData.content}
                  onInput={(e) => handleInputChange('content', e.detail.value)}
                  onFocus={() => setFocusedField('content')}
                  onBlur={() => setFocusedField(null)}
                  maxlength={500}
                />
                {errors.content && (
                  <Text className={styles.formItem_errorText}>{errors.content}</Text>
                )}
                <Text className={styles.formItem_charCount}>{formData.content.length}/500</Text>
              </View>
            </View>

            <View className={styles.contactInfo}>
              <View className={styles.contactInfo_infoItem}>
                <Text className={styles.contactInfo_icon}>📞</Text>
                <View className={styles.contactInfo_content}>
                  <Text className={styles.contactInfo_label}>客服热线</Text>
                  <Text className={styles.contactInfo_value}>400-123-4567</Text>
                </View>
              </View>
              <View className={styles.contactInfo_infoItem}>
                <Text className={styles.contactInfo_icon}>📧</Text>
                <View className={styles.contactInfo_content}>
                  <Text className={styles.contactInfo_label}>邮箱</Text>
                  <Text className={styles.contactInfo_value}>support@company.com</Text>
                </View>
              </View>
              <View className={styles.contactInfo_infoItem}>
                <Text className={styles.contactInfo_icon}>🕐</Text>
                <View className={styles.contactInfo_content}>
                  <Text className={styles.contactInfo_label}>工作时间</Text>
                  <Text className={styles.contactInfo_value}>周一至周五 9:00-18:00</Text>
                </View>
              </View>
              <View className={styles.contactInfo_infoItem}>
                <Text className={styles.contactInfo_icon}>💬</Text>
                <View className={styles.contactInfo_content}>
                  <Text className={styles.contactInfo_label}>在线客服</Text>
                  <Text className={styles.contactInfo_value}>工作日9:00-18:00实时响应</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {activeTab === 'contact' && (
        <View className={styles.submitBar}>
          <View
            className={classnames(
              styles.submitBar_submitBtn,
              (!canSubmit || submitting) && styles.submitBar_submitBtnDisabled
            )}
            onClick={canSubmit && !submitting ? handleSubmit : undefined}
          >
            {submitting ? '提交中...' : '提交'}
          </View>
        </View>
      )}

      {submitting && (
        <View className={styles.loadingOverlay}>
          <View className={styles.loadingOverlay_loadingContent}>
            <View className={styles.loadingOverlay_spinner} />
            <Text className={styles.loadingOverlay_loadingText}>正在提交...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default HelpCenterPage;
