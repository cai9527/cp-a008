import React, { useState } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import NavBar from '@/components/NavBar';
import {
  companyInfo,
  teamMembers,
  timelineList,
  cultureList,
  partnerList,
  contactInfo,
} from '@/data/aboutUs';
import type { TeamMember, TimelineItem } from '@/types/about';

const AboutUsPage: React.FC = () => {
  const [showFullIntro, setShowFullIntro] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showAllTimeline, setShowAllTimeline] = useState(false);
  const [showAllTeam, setShowAllTeam] = useState(false);

  const displayTimeline = showAllTimeline ? timelineList : timelineList.slice(0, 5);
  const displayTeam = showAllTeam ? teamMembers : teamMembers.slice(0, 4);

  const getTimelineTypeLabel = (type: TimelineItem['type']) => {
    const map: Record<string, string> = {
      milestone: '里程碑',
      product: '产品发布',
      event: '重要事件',
      award: '荣誉奖项',
    };
    return map[type] || type;
  };

  const handleMemberClick = (member: TeamMember) => {
    console.log('[AboutUs] Click team member:', member.name);
    setSelectedMember(member);
  };

  const handleCopyText = (text: string, label: string) => {
    console.log('[AboutUs] Copy text:', label);
    Taro.setClipboardData({
      data: text,
      success: () => {
        Taro.showToast({
          title: `${label}已复制`,
          icon: 'success',
          duration: 2000,
        });
      },
    });
  };

  const handleCallPhone = () => {
    console.log('[AboutUs] Call phone:', contactInfo.phone);
    Taro.makePhoneCall({
      phoneNumber: contactInfo.phone,
    });
  };

  const handlePartnerClick = (partner: any) => {
    console.log('[AboutUs] Click partner:', partner.name);
    Taro.showModal({
      title: partner.name,
      content: `${partner.description}\n\n合作始于：${partner.cooperationStart}年`,
      showCancel: false,
      confirmText: '我知道了',
    });
  };

  return (
    <View className={styles.page}>
      <NavBar title="关于我们" />
      <ScrollView className={styles.pageContainer} scrollY>
        <View className={styles.hero}>
          <View className={styles.hero_content}>
            <View className={styles.hero_logoWrapper}>
              <Text className={styles.hero_logoText}>智</Text>
            </View>
            <Text className={styles.hero_name}>{companyInfo.name}</Text>
            <Text className={styles.hero_slogan}>{companyInfo.slogan}</Text>
          </View>
        </View>

        <View className={styles.statsBar}>
          <View className={styles.statsBar_statItem}>
            <Text className={styles.statsBar_statNum}>{companyInfo.foundedYear}</Text>
            <Text className={styles.statsBar_statLabel}>成立年份</Text>
          </View>
          <View className={styles.statsBar_statItem}>
            <Text className={styles.statsBar_statNum}>{companyInfo.employees}</Text>
            <Text className={styles.statsBar_statLabel}>员工规模</Text>
          </View>
          <View className={styles.statsBar_statItem}>
            <Text className={styles.statsBar_statNum}>10000+</Text>
            <Text className={styles.statsBar_statLabel}>企业客户</Text>
          </View>
          <View className={styles.statsBar_statItem}>
            <Text className={styles.statsBar_statNum}>500万+</Text>
            <Text className={styles.statsBar_statLabel}>服务员工</Text>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.section_sectionTitle}>
            <Text className={styles.section_sectionTitle_icon}>🏢</Text>
            公司简介
          </Text>
          <View className={styles.companyIntro}>
            <Text className={styles.companyIntro_desc}>
              {showFullIntro
                ? companyInfo.fullDescription
                : companyInfo.description}
            </Text>
            <View
              className={styles.companyIntro_moreBtn}
              onClick={() => setShowFullIntro(!showFullIntro)}
            >
              <Text>{showFullIntro ? '收起' : '展开更多'}</Text>
              <Text
                className={classnames(
                  styles.companyIntro_moreBtn_arrow,
                  showFullIntro && styles.companyIntro_moreBtn_arrowExpanded
                )}
              >
                ▾
              </Text>
            </View>

            <View className={styles.infoGrid}>
              <View className={styles.infoGrid_infoItem}>
                <Text className={styles.infoGrid_icon}>📅</Text>
                <View className={styles.infoGrid_content}>
                  <Text className={styles.infoGrid_label}>成立时间</Text>
                  <Text className={styles.infoGrid_value}>{companyInfo.foundedYear}年</Text>
                </View>
              </View>
              <View className={styles.infoGrid_infoItem}>
                <Text className={styles.infoGrid_icon}>👥</Text>
                <View className={styles.infoGrid_content}>
                  <Text className={styles.infoGrid_label}>员工规模</Text>
                  <Text className={styles.infoGrid_value}>{companyInfo.employees}人</Text>
                </View>
              </View>
              <View className={styles.infoGrid_infoItem}>
                <Text className={styles.infoGrid_icon}>📍</Text>
                <View className={styles.infoGrid_content}>
                  <Text className={styles.infoGrid_label}>总部地址</Text>
                  <Text className={styles.infoGrid_value}>{companyInfo.headquarters}</Text>
                </View>
              </View>
              <View className={styles.infoGrid_infoItem}>
                <Text className={styles.infoGrid_icon}>🌐</Text>
                <View className={styles.infoGrid_content}>
                  <Text className={styles.infoGrid_label}>官方网站</Text>
                  <Text className={styles.infoGrid_value}>{companyInfo.website}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.section_sectionTitle}>
            <Text className={styles.section_sectionTitle_icon}>👨‍💼</Text>
            核心团队
          </Text>
          <Text className={styles.section_sectionSubtitle}>
            汇聚行业精英，共同打造优秀的产品与服务
          </Text>

          <View className={styles.teamList}>
            {displayTeam.map((member) => (
              <View
                key={member.id}
                className={styles.teamMember}
                onClick={() => handleMemberClick(member)}
              >
                <View className={styles.teamMember_avatar}>
                  {member.avatar ? (
                    <Image
                      className={styles.teamMember_avatarImage}
                      src={member.avatar}
                      mode="aspectFill"
                    />
                  ) : (
                    <View className={styles.teamMember_avatarPlaceholder}>
                      <Text>{member.name.charAt(0)}</Text>
                    </View>
                  )}
                </View>
                <View className={styles.teamMember_content}>
                  <Text className={styles.teamMember_name}>{member.name}</Text>
                  <Text className={styles.teamMember_position}>{member.position}</Text>
                  <Text className={styles.teamMember_department}>{member.department}</Text>
                  <Text className={styles.teamMember_bio}>{member.bio}</Text>
                  <View className={styles.teamMember_expertise}>
                    {member.expertise.slice(0, 3).map((skill, i) => (
                      <Text key={i} className={styles.teamMember_expertise_tag}>
                        {skill}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </View>

          {teamMembers.length > 4 && (
            <View
              className={styles.sectionMore}
              onClick={() => setShowAllTeam(!showAllTeam)}
            >
              <Text>{showAllTeam ? '收起' : '查看更多成员'}</Text>
              <Text className={styles.sectionMore_arrow}>›</Text>
            </View>
          )}
        </View>

        <View className={styles.section}>
          <Text className={styles.section_sectionTitle}>
            <Text className={styles.section_sectionTitle_icon}>📅</Text>
            发展历程
          </Text>
          <Text className={styles.section_sectionSubtitle}>
            见证我们的成长与突破
          </Text>

          <View className={styles.timeline}>
            {displayTimeline.map((item) => (
              <View key={item.id} className={styles.timeline_timelineItem}>
                <View className={styles.timeline_timelineDot}>
                  <Text>{item.icon}</Text>
                </View>
                <View className={styles.timeline_timelineHeader}>
                  <Text className={styles.timeline_date}>
                    {item.year}年{item.month}
                  </Text>
                  <Text className={styles.timeline_type}>
                    {getTimelineTypeLabel(item.type)}
                  </Text>
                </View>
                <Text className={styles.timeline_title}>{item.title}</Text>
                <Text className={styles.timeline_desc}>{item.description}</Text>
              </View>
            ))}
          </View>

          {timelineList.length > 5 && (
            <View
              className={styles.sectionMore}
              onClick={() => setShowAllTimeline(!showAllTimeline)}
            >
              <Text>{showAllTimeline ? '收起' : '查看更多历程'}</Text>
              <Text className={styles.sectionMore_arrow}>›</Text>
            </View>
          )}
        </View>

        <View className={styles.section}>
          <Text className={styles.section_sectionTitle}>
            <Text className={styles.section_sectionTitle_icon}>💎</Text>
            企业文化
          </Text>
          <Text className={styles.section_sectionSubtitle}>
            我们的价值观，指导我们前行
          </Text>

          <View className={styles.cultureGrid}>
            {cultureList.map((item) => (
              <View key={item.id} className={styles.cultureItem}>
                <Text className={styles.cultureItem_icon}>{item.icon}</Text>
                <Text className={styles.cultureItem_title}>{item.title}</Text>
                <Text className={styles.cultureItem_desc}>{item.description}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.section_sectionTitle}>
            <Text className={styles.section_sectionTitle_icon}>🤝</Text>
            合作伙伴
          </Text>
          <Text className={styles.section_sectionSubtitle}>
            与优秀的企业同行，共创美好未来
          </Text>

          <ScrollView className={styles.partnerScroll} scrollX>
            {partnerList.map((partner) => (
              <View
                key={partner.id}
                className={styles.partnerItem}
                onClick={() => handlePartnerClick(partner)}
              >
                <View className={styles.partnerItem_logo}>
                  <Image
                    className={styles.partnerItem_logoImage}
                    src={partner.logo}
                    mode="aspectFill"
                  />
                </View>
                <Text className={styles.partnerItem_name}>{partner.name}</Text>
                <Text className={styles.partnerItem_industry}>{partner.industry}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View className={styles.section}>
          <Text className={styles.section_sectionTitle}>
            <Text className={styles.section_sectionTitle_icon}>📞</Text>
            联系我们
          </Text>
          <Text className={styles.section_sectionSubtitle}>
            期待与您的交流与合作
          </Text>

          <View className={styles.contactCard}>
            <View
              className={styles.contactCard_contactItem}
              onClick={() => handleCallPhone()}
            >
              <Text className={styles.contactCard_icon}>📞</Text>
              <View className={styles.contactCard_content}>
                <Text className={styles.contactCard_label}>客服热线</Text>
                <Text className={styles.contactCard_value}>{contactInfo.phone}</Text>
              </View>
            </View>
            <View
              className={styles.contactCard_contactItem}
              onClick={() => handleCopyText(contactInfo.email, '邮箱')}
            >
              <Text className={styles.contactCard_icon}>📧</Text>
              <View className={styles.contactCard_content}>
                <Text className={styles.contactCard_label}>邮箱</Text>
                <Text className={styles.contactCard_value}>{contactInfo.email}</Text>
              </View>
            </View>
            <View
              className={styles.contactCard_contactItem}
              onClick={() => handleCopyText(contactInfo.address, '地址')}
            >
              <Text className={styles.contactCard_icon}>📍</Text>
              <View className={styles.contactCard_content}>
                <Text className={styles.contactCard_label}>公司地址</Text>
                <Text className={styles.contactCard_value}>{contactInfo.address}</Text>
              </View>
            </View>
            <View className={styles.contactCard_contactItem}>
              <Text className={styles.contactCard_icon}>🕐</Text>
              <View className={styles.contactCard_content}>
                <Text className={styles.contactCard_label}>工作时间</Text>
                <Text className={styles.contactCard_value}>{contactInfo.workingHours}</Text>
              </View>
            </View>
            <View
              className={styles.contactCard_contactItem}
              onClick={() => handleCopyText(contactInfo.wechat, '微信号')}
            >
              <Text className={styles.contactCard_icon}>💬</Text>
              <View className={styles.contactCard_content}>
                <Text className={styles.contactCard_label}>官方微信</Text>
                <Text className={styles.contactCard_value}>{contactInfo.wechat}</Text>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.footer}>
          <Text className={styles.footer_version}>版本 v1.0.0</Text>
          <Text className={styles.footer_copyright}>
            © 2024 {companyInfo.name} 版权所有
          </Text>
        </View>
      </ScrollView>

      {selectedMember && (
        <View
          className={styles.memberPopup}
          onClick={() => setSelectedMember(null)}
        >
          <View
            className={styles.memberPopup_content}
            onClick={(e) => e.stopPropagation()}
          >
            <Text
              className={styles.memberPopup_closeBtn}
              onClick={() => setSelectedMember(null)}
            >
              ✕
            </Text>
            <View className={styles.memberPopup_header}>
              <View className={styles.memberPopup_avatar}>
                {selectedMember.avatar ? (
                  <Image
                    className={styles.memberPopup_avatarImage}
                    src={selectedMember.avatar}
                    mode="aspectFill"
                  />
                ) : (
                  <View className={styles.teamMember_avatarPlaceholder}>
                    <Text>{selectedMember.name.charAt(0)}</Text>
                  </View>
                )}
              </View>
              <View className={styles.memberPopup_info}>
                <Text className={styles.memberPopup_name}>{selectedMember.name}</Text>
                <Text className={styles.memberPopup_position}>{selectedMember.position}</Text>
                <Text className={styles.memberPopup_department}>{selectedMember.department}</Text>
              </View>
            </View>

            <Text className={styles.memberPopup_sectionTitle}>个人简介</Text>
            <Text className={styles.memberPopup_bio}>{selectedMember.bio}</Text>

            <Text className={styles.memberPopup_sectionTitle}>专业领域</Text>
            <View className={styles.memberPopup_expertise}>
              {selectedMember.expertise.map((skill, i) => (
                <Text key={i} className={styles.memberPopup_expertise_tag}>
                  {skill}
                </Text>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default AboutUsPage;
