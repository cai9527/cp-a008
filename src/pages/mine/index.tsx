import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAuthStore } from '@/store/useAuthStore';
import { useCheckinStore } from '@/store/useCheckinStore';
import { authService } from '@/services/auth';
import { leaveService } from '@/services/leave';

const MinePage: React.FC = () => {
  const { userInfo, isLoggedIn, hasRehydrated, logout } = useAuthStore();
  const { stats } = useCheckinStore();
  const [leaveBalance, setLeaveBalance] = useState<any>(null);

  const loadData = async () => {
    console.log('[MinePage] Loading data...');
    try {
      const balance = await leaveService.getBalance();
      setLeaveBalance(balance);
    } catch (err) {
      console.error('[MinePage] Load data error:', err);
    }
  };

  useEffect(() => {
    if (hasRehydrated && isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn, hasRehydrated]);

  useDidShow(() => {
    if (hasRehydrated && isLoggedIn) {
      loadData();
    }
  });

  useEffect(() => {
    if (hasRehydrated && !isLoggedIn) {
      Taro.redirectTo({ url: '/pages/login/index' });
    }
  }, [isLoggedIn, hasRehydrated]);

  const handleLogout = () => {
    Taro.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await authService.logout();
            logout();
            Taro.showToast({ title: '已退出登录', icon: 'success' });
            setTimeout(() => {
              Taro.reLaunch({ url: '/pages/login/index' });
            }, 300);
          } catch (err) {
            console.error('[MinePage] Logout error:', err);
          }
        }
      },
    });
  };

  const handleGoLeaveRecords = () => {
    Taro.navigateTo({ url: '/pages/leave-records/index' });
  };

  const handleGoLeaveApply = () => {
    Taro.navigateTo({ url: '/pages/leave-apply/index' });
  };

  const handleGoSettings = () => {
    Taro.showToast({ title: '设置功能开发中', icon: 'none' });
  };

  const handleGoHelp = () => {
    Taro.showToast({ title: '帮助功能开发中', icon: 'none' });
  };

  const handleGoAbout = () => {
    Taro.showToast({ title: '关于功能开发中', icon: 'none' });
  };

  const handleChangePassword = () => {
    Taro.navigateTo({ url: '/pages/change-password/index' });
  };

  const menuItems = [
    {
      icon: '📝',
      iconClass: 'blue',
      text: '请假申请',
      onClick: handleGoLeaveApply,
    },
    {
      icon: '📋',
      iconClass: 'green',
      text: '请假记录',
      onClick: handleGoLeaveRecords,
    },
    {
      icon: '🔒',
      iconClass: 'orange',
      text: '修改密码',
      onClick: handleChangePassword,
    },
    {
      icon: '⚙️',
      iconClass: 'purple',
      text: '设置',
      onClick: handleGoSettings,
    },
    {
      icon: '❓',
      iconClass: 'gray',
      text: '帮助中心',
      onClick: handleGoHelp,
    },
    {
      icon: 'ℹ️',
      iconClass: 'gray',
      text: '关于我们',
      onClick: handleGoAbout,
    },
  ];

  return (
    <ScrollView className={styles.page} scrollY>
      <View className="pageContainer">
        <View className={styles.header}>
          <View className={styles.userInfo}>
            <View className={styles.avatar}>
              {userInfo?.avatar ? (
                <Image src={userInfo.avatar} mode="aspectFill" />
              ) : (
                <Text>{userInfo?.name?.charAt(0) || '用'}</Text>
              )}
            </View>
            <View className={styles.userText}>
              <Text className={styles.userName}>{userInfo?.name || '用户'}</Text>
              <Text className={styles.userDept}>
                {userInfo?.department} · {userInfo?.position}
              </Text>
              <Text className={styles.userNo}>工号：{userInfo?.employeeNo}</Text>
            </View>
          </View>

          <View className={styles.statsSummary}>
            <View className={styles.statsItem}>
              <Text className={styles.statsNum}>{stats?.presentDays || 0}</Text>
              <Text className={styles.statsLabel}>本月出勤</Text>
            </View>
            <View className={styles.statsItem}>
              <Text className={styles.statsNum}>{stats?.lateDays || 0}</Text>
              <Text className={styles.statsLabel}>迟到次数</Text>
            </View>
            <View className={styles.statsItem}>
              <Text className={styles.statsNum}>{stats?.attendanceRate || 0}%</Text>
              <Text className={styles.statsLabel}>出勤率</Text>
            </View>
          </View>
        </View>

        <View className={styles.leaveBalance}>
          <Text className={styles.sectionTitle}>假期余额</Text>
          <View className={styles.balanceGrid}>
            <View className={styles.balanceItem}>
              <Text className={styles.balanceValue}>{leaveBalance?.annual || 0}</Text>
              <Text className={styles.balanceLabel}>年假</Text>
            </View>
            <View className={styles.balanceItem}>
              <Text className={styles.balanceValue}>{leaveBalance?.sick || 0}</Text>
              <Text className={styles.balanceLabel}>病假</Text>
            </View>
            <View className={styles.balanceItem}>
              <Text className={styles.balanceValue}>{leaveBalance?.personal || 0}</Text>
              <Text className={styles.balanceLabel}>事假</Text>
            </View>
            <View className={styles.balanceItem}>
              <Text className={styles.balanceValue}>{leaveBalance?.other || 0}</Text>
              <Text className={styles.balanceLabel}>其他</Text>
            </View>
          </View>
        </View>

        <View className={styles.menuList}>
          {menuItems.map((item, index) => (
            <View key={index} className={styles.menuItem} onClick={item.onClick}>
              <View className={classnames(styles.menuIcon, styles[item.iconClass])}>
                {item.icon}
              </View>
              <Text className={styles.menuText}>{item.text}</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          ))}
        </View>

        <View className={styles.logoutBtn} onClick={handleLogout}>
          退出登录
        </View>
      </View>
    </ScrollView>
  );
};

export default MinePage;
