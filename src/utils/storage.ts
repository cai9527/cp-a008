import Taro from '@tarojs/taro';

export const storage = {
  set: async (key: string, value: any): Promise<void> => {
    try {
      await Taro.setStorage({
        key,
        data: typeof value === 'string' ? value : JSON.stringify(value),
      });
    } catch (err) {
      console.error('[Storage] Set error:', key, err);
    }
  },

  get: async <T = any>(key: string): Promise<T | null> => {
    try {
      const res = await Taro.getStorage({ key });
      if (!res.data) return null;
      if (typeof res.data === 'string') {
        try {
          return JSON.parse(res.data) as T;
        } catch {
          return res.data as T;
        }
      }
      return res.data as T;
    } catch (err) {
      console.warn('[Storage] Get error:', key, err);
      return null;
    }
  },

  remove: async (key: string): Promise<void> => {
    try {
      await Taro.removeStorage({ key });
    } catch (err) {
      console.error('[Storage] Remove error:', key, err);
    }
  },

  clear: async (): Promise<void> => {
    try {
      await Taro.clearStorage();
    } catch (err) {
      console.error('[Storage] Clear error:', err);
    }
  },
};
