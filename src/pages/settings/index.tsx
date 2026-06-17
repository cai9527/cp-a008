import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import NavBar from '@/components/NavBar';
import { useAuthStore } from '@/store/useAuthStore';

const SettingsPage: React.FC = () => {
  const { userInfo } = useAuthStore();

  const handleGoProfile = () => {
    Taro.navigateTo({ url: '/pages/profile-edit/index' });
  };

  const handleGoChangePassword = () => {
    Taro.navigateTo({ url: '/pages/change-password/index' });
  };

  const handleGoHelpCenter = () => {
    Taro.navigateTo({ url: '/pages/help-center/index' });
  };

  const handleGoAbout = () => {
    Taro.navigateTo({ url: '/pages/about-us/index' });
  };

  const handleClearCache = async () => {
    const res = await Taro.showModal({
      title: '清除缓存',
      content: '确定要清除本地缓存吗？此操作不会影响您的账号数据。',
      confirmText: '确定清除',
      cancelText: '取消',
    });
    if (res.confirm) {
      await Taro.clearStorage();
      Taro.showToast({ title: '缓存已清除', icon: 'success' });
    }
  };

  const handleCheckUpdate = () => {
    Taro.showLoading({ title: '检查更新中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showModal({
        title: '检查更新',
        content: '当前已是最新版本 v1.0.0',
        showCancel: false,
        confirmText: '我知道了',
      });
    }, 1000);
  };

  const accountMenuItems = [
    {
      icon: '👤',
      iconClass: 'blue',
      text: '个人账号信息',
      desc: `${userInfo?.name || '用户'} · ${userInfo?.phone || ''}`,
      onClick: handleGoProfile,
    },
    {
      icon: '🔒',
      iconClass: 'orange',
      text: '修改密码',
      desc: '定期更换密码，保障账号安全',
      onClick: handleGoChangePassword,
    },
  ];

  const otherMenuItems = [
    {
      icon: '❓',
      iconClass: 'gray',
      text: '帮助中心',
      desc: '常见问题与操作指南',
      onClick: handleGoHelpCenter,
    },
    {
      icon: '🗑️',
      iconClass: 'gray',
      text: '清除缓存',
      desc: '释放本地存储空间',
      onClick: handleClearCache,
    },
    {
      icon: '🔄',
      iconClass: 'gray',
      text: '检查更新',
      desc: '当前版本 v1.0.0',
      onClick: handleCheckUpdate,
    },
    {
      icon: 'ℹ️',
      iconClass: 'gray',
      text: '关于我们',
      desc: '了解产品与团队',
      onClick: handleGoAbout,
    },
  ];

  return (
    <View className={styles.page}>
      <NavBar title="设置" />
      <View className="pageContainer">
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>账号设置</Text>
          {accountMenuItems.map((item, index) => (
            <View key={index} className={styles.menuItem} onClick={item.onClick}>
              <View className={`${styles.menuIcon} ${styles[item.iconClass]}`}>
                {item.icon}
              </View>
              <View className={styles.menuContent}>
                <Text className={styles.menuText}>{item.text}</Text>
                {item.desc && <Text className={styles.menuDesc}>{item.desc}</Text>}
              </View>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          ))}
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>其他</Text>
          {otherMenuItems.map((item, index) => (
            <View key={index} className={styles.menuItem} onClick={item.onClick}>
              <View className={`${styles.menuIcon} ${styles[item.iconClass]}`}>
                {item.icon}
              </View>
              <View className={styles.menuContent}>
                <Text className={styles.menuText}>{item.text}</Text>
                {item.desc && <Text className={styles.menuDesc}>{item.desc}</Text>}
              </View>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          ))}
        </View>

        <Text className={styles.versionInfo}>© 2024 智考勤 · v1.0.0</Text>
      </View>
    </View>
  );
};

export default SettingsPage;
