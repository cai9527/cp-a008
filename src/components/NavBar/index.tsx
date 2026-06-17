import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { getCurrentPages } from '@tarojs/taro';
import styles from './index.module.scss';

interface NavBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ title, showBack = true, onBack }) => {
  const statusBarHeight = useMemo(() => {
    const sysInfo = Taro.getSystemInfoSync();
    return sysInfo.statusBarHeight || 20;
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    const pages = getCurrentPages();
    if (pages.length <= 1) {
      Taro.switchTab({
        url: '/pages/home/index',
      });
      return;
    }

    Taro.navigateBack({
      delta: 1,
    }).catch(() => {
      Taro.switchTab({
        url: '/pages/home/index',
      });
    });
  };

  return (
    <View className={styles.navBar} style={{ paddingTop: `${statusBarHeight}px` }}>
      <View className={styles.navBarContent}>
        <View className={styles.navBarLeft}>
          {showBack && (
            <View className={styles.backBtn} onClick={handleBack}>
              <Text className={styles.backIcon}>‹</Text>
            </View>
          )}
        </View>
        <View className={styles.navBarCenter}>
          <Text className={styles.navBarTitle}>{title}</Text>
        </View>
        <View className={styles.navBarRight} />
      </View>
    </View>
  );
};

export default NavBar;
