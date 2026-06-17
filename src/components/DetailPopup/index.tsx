import React, { useEffect, useState } from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface DetailPopupProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const DetailPopup: React.FC<DetailPopupProps> = ({ visible, title, onClose, children }) => {
  const [animating, setAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      setTimeout(() => {
        setAnimating(true);
      }, 50);
    } else {
      setAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!shouldRender) return null;

  return (
    <View className={`${styles.overlay} ${animating ? styles.overlayVisible : ''}`} onClick={onClose}>
      <View
        className={`${styles.popup} ${animating ? styles.popupVisible : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <View className={styles.handleBar} />
        <View className={styles.header}>
          <Text className={styles.title}>{title}</Text>
          <View className={styles.closeBtn} onClick={onClose}>
            <Text className={styles.closeIcon}>✕</Text>
          </View>
        </View>
        <View className={styles.content}>{children}</View>
      </View>
    </View>
  );
};

export default DetailPopup;
