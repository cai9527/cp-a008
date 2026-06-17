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
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!oldPassword) {
      throw new Error('请输入当前密码');
    }
    if (oldPassword.length < 6) {
      throw new Error('当前密码长度不能少于6位');
    }
    if (!newPassword) {
      throw new Error('请输入新密码');
    }
    if (newPassword.length < 8) {
      throw new Error('新密码长度不能少于8位');
    }
    if (newPassword.length > 20) {
      throw new Error('新密码长度不能超过20位');
    }
    if (/\s/.test(newPassword)) {
      throw new Error('新密码不能包含空格');
    }
    if (!/[a-zA-Z]/.test(newPassword)) {
      throw new Error('新密码必须包含字母');
    }
    if (!/\d/.test(newPassword)) {
      throw new Error('新密码必须包含数字');
    }
    if (newPassword === oldPassword) {
      throw new Error('新密码不能与当前密码相同');
    }

    let similarityCount = 0;
    for (let i = 0; i < oldPassword.length && i < newPassword.length; i++) {
      if (oldPassword[i] === newPassword[i]) {
        similarityCount++;
      }
    }
    const similarityThreshold = Math.min(oldPassword.length, newPassword.length) * 0.6;
    if (similarityCount > similarityThreshold) {
      throw new Error('新密码与当前密码过于相似，请重新设置');
    }

    const commonWeakPasswords = [
      '12345678', '87654321', 'password', 'qwerty123',
      '11111111', '00000000', 'abc12345', '1234abcd'
    ];
    if (commonWeakPasswords.includes(newPassword.toLowerCase())) {
      throw new Error('新密码强度过低，请勿使用常见密码');
    }

    const MOCK_CURRENT_PASSWORD = '123456';
    if (oldPassword !== MOCK_CURRENT_PASSWORD) {
      throw new Error('当前密码不正确，请重新输入');
    }

    console.log('[AuthService] Password updated successfully');
  },

  getUserInfo: async (): Promise<UserInfo> => {
    console.log('[AuthService] Get user info');
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockUserInfo;
  },
};
