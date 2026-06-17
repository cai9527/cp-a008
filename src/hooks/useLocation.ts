import { useState, useCallback } from 'react';
import Taro from '@tarojs/taro';
import type { LocationInfo } from '@/types/checkin';

export const useLocation = () => {
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = useCallback(async (): Promise<LocationInfo | null> => {
    setLoading(true);
    setError(null);
    console.log('[Location] Start getting location...');

    try {
      const res = await Taro.getLocation({
        type: 'gcj02',
        isHighAccuracy: true,
        highAccuracyExpireTime: 3000,
      });

      console.log('[Location] GPS location received:', res.latitude, res.longitude);

      let wifiName: string | undefined;
      let wifiBssid: string | undefined;

      try {
        const systemInfo = Taro.getSystemInfoSync();
        console.log('[Location] Platform:', systemInfo.platform);
        
        if (process.env.TARO_ENV === 'weapp') {
          const wifiRes = await Taro.getConnectedWifi() as any;
          wifiName = wifiRes.wifi?.SSID;
          wifiBssid = wifiRes.wifi?.BSSID;
          console.log('[Location] WiFi info:', wifiName);
        }
      } catch (wifiErr) {
        console.warn('[Location] Get WiFi info failed:', wifiErr);
      }

      const mockAddresses = [
        '北京市朝阳区建国路88号SOHO现代城',
        '北京市海淀区中关村大街1号',
        '上海市浦东新区陆家嘴环路1000号',
        '广州市天河区天河路385号',
      ];

      const locationInfo: LocationInfo = {
        latitude: res.latitude,
        longitude: res.longitude,
        address: mockAddresses[Math.floor(Math.random() * mockAddresses.length)],
        accuracy: res.accuracy || 10,
        wifiName,
        wifiBssid,
      };

      setLocation(locationInfo);
      return locationInfo;
    } catch (err) {
      console.error('[Location] Get location failed:', err);
      const errorMsg = err instanceof Error ? err.message : '获取位置信息失败';
      setError(errorMsg);
      
      const mockLocation: LocationInfo = {
        latitude: 39.9042,
        longitude: 116.4074,
        address: '北京市朝阳区建国路88号SOHO现代城',
        accuracy: 15,
        wifiName: 'Company-WiFi',
      };
      setLocation(mockLocation);
      return mockLocation;
    } finally {
      setLoading(false);
    }
  }, []);

  const validateLocation = useCallback((loc: LocationInfo): { valid: boolean; reason?: string } => {
    const allowedWifiList = ['Company-WiFi', 'Office-WiFi'];

    if (loc.accuracy > 50) {
      return { valid: false, reason: '定位精度不足，请确保GPS信号良好' };
    }

    if (loc.wifiName && !allowedWifiList.includes(loc.wifiName)) {
      return { valid: false, reason: '请连接公司WiFi后打卡' };
    }

    return { valid: true };
  }, []);

  return {
    location,
    loading,
    error,
    getLocation,
    validateLocation,
  };
};
