import { useState, useCallback, useRef, useEffect } from 'react';
import Taro from '@tarojs/taro';
import type { LocationInfo } from '@/types/checkin';

export type LocationStatus = 'idle' | 'locating' | 'success' | 'error';

export interface LocationState {
  status: LocationStatus;
  location: LocationInfo | null;
  error: string | null;
  errorCode?: number;
  timestamp: number | null;
  retryCount: number;
}

const MAX_RETRY_COUNT = 3;
const LOCATION_TIMEOUT = 10000;

const errorMessages: Record<string, { message: string; code: number }> = {
  1: { message: '定位权限被拒绝，请在设置中开启定位权限', code: 1 },
  2: { message: '无法获取定位，请检查GPS或网络连接', code: 2 },
  3: { message: '定位请求超时，请重试', code: 3 },
  4: { message: '系统定位服务不可用', code: 4 },
  11: { message: '定位结果无效，请重试', code: 11 },
  12: { message: '定位精度不足，请在开阔地带重试', code: 12 },
};

const getErrorMessage = (err: any): { message: string; code: number } => {
  if (!err) return { message: '未知错误', code: -1 };

  const errCode = typeof err.errCode === 'number' ? err.errCode : err.code;

  if (typeof errCode === 'number' && errorMessages[errCode]) {
    return errorMessages[errCode];
  }

  const errMsg = err.errMsg || err.message || String(err);
  if (errMsg.includes('auth') || errMsg.includes('deny') || errMsg.includes('权限')) {
    return { message: '定位权限被拒绝，请在设置中开启定位权限', code: 1 };
  }
  if (errMsg.includes('timeout') || errMsg.includes('超时')) {
    return { message: '定位请求超时，请重试', code: 3 };
  }
  if (errMsg.includes('available') || errMsg.includes('不可用')) {
    return { message: '系统定位服务不可用', code: 4 };
  }

  return { message: '获取位置信息失败，请重试', code: -1 };
};

const mockAddresses = [
  '北京市朝阳区建国路88号SOHO现代城',
  '北京市海淀区中关村大街1号',
  '上海市浦东新区陆家嘴环路1000号',
  '广州市天河区天河路385号',
  '深圳市南山区科技园南区',
  '杭州市西湖区文三路478号',
  '成都市锦江区红星路三段1号',
];

export const useLocation = () => {
  const [state, setState] = useState<LocationState>({
    status: 'idle',
    location: null,
    error: null,
    timestamp: null,
    retryCount: 0,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isRequestingRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const getWifiInfo = useCallback(async (): Promise<{ wifiName?: string; wifiBssid?: string }> => {
    try {
      if (process.env.TARO_ENV === 'weapp') {
        const wifiRes = (await Taro.getConnectedWifi()) as any;
        return {
          wifiName: wifiRes.wifi?.SSID,
          wifiBssid: wifiRes.wifi?.BSSID,
        };
      }
    } catch (wifiErr) {
      console.warn('[Location] Get WiFi info failed:', wifiErr);
    }
    return {};
  }, []);

  const getLocation = useCallback(
    async (force = false): Promise<LocationInfo | null> => {
      if (isRequestingRef.current && !force) {
        console.log('[Location] Request already in progress, skip...');
        return state.location;
      }

      isRequestingRef.current = true;
      clearTimer();

      setState((prev) => ({
        ...prev,
        status: 'locating',
        error: null,
        errorCode: undefined,
      }));

      console.log('[Location] Start getting location...');

      try {
        timerRef.current = setTimeout(() => {
          console.warn('[Location] Request timeout');
          if (isRequestingRef.current) {
            const errInfo = getErrorMessage({ errMsg: 'timeout' });
            setState((prev) => ({
              ...prev,
              status: 'error',
              error: errInfo.message,
              errorCode: errInfo.code,
              retryCount: prev.retryCount + 1,
            }));
            isRequestingRef.current = false;
          }
        }, LOCATION_TIMEOUT);

        const res = await Taro.getLocation({
          type: 'gcj02',
          isHighAccuracy: true,
          highAccuracyExpireTime: 4000,
        });

        clearTimer();

        console.log('[Location] GPS location received:', {
          lat: res.latitude,
          lng: res.longitude,
          accuracy: res.accuracy,
        });

        if (typeof res.latitude !== 'number' || typeof res.longitude !== 'number') {
          throw { errCode: 11, errMsg: 'invalid location result' };
        }

        const wifiInfo = await getWifiInfo();

        const locationInfo: LocationInfo = {
          latitude: Number(res.latitude.toFixed(6)),
          longitude: Number(res.longitude.toFixed(6)),
          address: mockAddresses[Math.floor(Math.random() * mockAddresses.length)],
          accuracy: Math.round(res.accuracy || 10),
          ...wifiInfo,
        };

        setState({
          status: 'success',
          location: locationInfo,
          error: null,
          errorCode: undefined,
          timestamp: Date.now(),
          retryCount: 0,
        });

        console.log('[Location] Get location success:', locationInfo);
        return locationInfo;
      } catch (err) {
        clearTimer();
        const errInfo = getErrorMessage(err);
        console.error('[Location] Get location failed:', err, errInfo);

        setState((prev) => ({
          ...prev,
          status: 'error',
          error: errInfo.message,
          errorCode: errInfo.code,
          retryCount: prev.retryCount + 1,
        }));

        return null;
      } finally {
        isRequestingRef.current = false;
        clearTimer();
      }
    },
    [state.location, clearTimer, getWifiInfo]
  );

  const retry = useCallback(() => {
    if (state.retryCount >= MAX_RETRY_COUNT) {
      console.warn('[Location] Max retry count reached:', MAX_RETRY_COUNT);
      Taro.showModal({
        title: '定位失败',
        content: '多次定位失败，请检查定位权限是否开启，或移动到信号较好的位置后重试。',
        confirmText: '前往设置',
        cancelText: '取消',
        success: async (res) => {
          if (res.confirm) {
            if (process.env.TARO_ENV === 'weapp') {
              try {
                await Taro.openSetting();
              } catch (e) {
                console.warn('[Location] Open setting failed:', e);
              }
            }
          }
        },
      });
      return;
    }
    getLocation(true);
  }, [state.retryCount, getLocation]);

  const reset = useCallback(() => {
    clearTimer();
    isRequestingRef.current = false;
    setState({
      status: 'idle',
      location: null,
      error: null,
      timestamp: null,
      retryCount: 0,
    });
  }, [clearTimer]);

  const validateLocation = useCallback(
    (loc: LocationInfo): { valid: boolean; reason?: string } => {
      const allowedWifiList = ['Company-WiFi', 'Office-WiFi'];

      if (!loc) {
        return { valid: false, reason: '未获取到位置信息' };
      }

      if (loc.accuracy > 100) {
        return { valid: false, reason: '定位精度不足，请确保GPS信号良好' };
      }

      if (loc.wifiName && !allowedWifiList.includes(loc.wifiName)) {
        return { valid: false, reason: '请连接公司WiFi后打卡' };
      }

      return { valid: true };
    },
    []
  );

  useEffect(() => {
    return () => {
      clearTimer();
      isRequestingRef.current = false;
    };
  }, [clearTimer]);

  return {
    ...state,
    getLocation,
    retry,
    reset,
    validateLocation,
    isLocating: state.status === 'locating',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
    canRetry: state.status === 'error' && state.retryCount < MAX_RETRY_COUNT,
  };
};
