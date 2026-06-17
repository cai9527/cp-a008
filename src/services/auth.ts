import Taro from '@tarojs/taro';
import type { LoginParams, LoginResult, UserInfo } from '@/types/auth';

const mockUserInfo: UserInfo = {
  id: 'U001',
  name: '张三',
  phone: '13800138000',
  department: '技术研发部',
  position: '高级前端工程师',
  employeeNo: 'EMP2024001',
  avatar: 'https://picsum.photos/id/1005/200/200',
};

export const authService = {
  login: async (params: LoginParams): Promise<LoginResult> => {
    console.log('[AuthService] Login request:', params.phone, params.loginType);
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (params.loginType === 'password' && !params.password) {
      throw new Error('请输入密码');
    }
    if (params.loginType === 'code' && !params.code) {
      throw new Error('请输入验证码');
    }

    if (params.phone.length !== 11) {
      throw new Error('请输入正确的手机号');
    }

    const mockToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      token: mockToken,
      userInfo: mockUserInfo,
    };
  },

  sendCode: async (phone: string): Promise<void> => {
    console.log('[AuthService] Send code to:', phone);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (phone.length !== 11) {
      throw new Error('请输入正确的手机号');
    }

    Taro.showToast({
      title: '验证码已发送',
      icon: 'success',
    });
  },

  logout: async (): Promise<void> => {
    console.log('[AuthService] Logout');
    await new Promise((resolve) => setTimeout(resolve, 300));
  },

  updatePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    console.log('[AuthService] Update password');
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!oldPassword || !newPassword) {
      throw new Error('请输入完整的密码信息');
    }
    if (newPassword.length < 6) {
      throw new Error('新密码长度不能少于6位');
    }
  },

  getUserInfo: async (): Promise<UserInfo> => {
    console.log('[AuthService] Get user info');
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockUserInfo;
  },
};
