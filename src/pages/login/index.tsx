import React, { useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/useAuthStore';
import type { LoginParams } from '@/types/auth';

const LoginPage: React.FC = () => {
  const { login } = useAuthStore();

  const [loginType, setLoginType] = useState<'password' | 'code'>('code');
  const [phone, setPhone] = useState('13800138000');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [codeFocused, setCodeFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleSendCode = async () => {
    if (countdown > 0) return;
    if (phone.length !== 11) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }

    try {
      await authService.sendCode(phone);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('[LoginPage] Send code error:', err);
      Taro.showToast({
        title: err instanceof Error ? err.message : '发送失败',
        icon: 'none',
      });
    }
  };

  const handleLogin = async () => {
    console.log('[LoginPage] Handle login');

    if (!agreed) {
      Taro.showToast({ title: '请先同意用户协议', icon: 'none' });
      return;
    }

    if (phone.length !== 11) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }

    const params: LoginParams = {
      phone,
      loginType,
    };

    if (loginType === 'password') {
      if (!password) {
        Taro.showToast({ title: '请输入密码', icon: 'none' });
        return;
      }
      params.password = password;
    } else {
      if (!code) {
        Taro.showToast({ title: '请输入验证码', icon: 'none' });
        return;
      }
      params.code = code;
    }

    setLoading(true);
    try {
      const result = await authService.login(params);
      login(result);
      
      await Taro.showToast({ title: '登录成功', icon: 'success' });
      
      setTimeout(() => {
        Taro.reLaunch({ url: '/pages/home/index' });
      }, 300);

      console.log('[LoginPage] Login success');
    } catch (err) {
      console.error('[LoginPage] Login error:', err);
      Taro.showToast({
        title: err instanceof Error ? err.message : '登录失败',
        icon: 'none',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgetPassword = () => {
    Taro.showToast({ title: '功能开发中', icon: 'none' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View>
          <View className={styles.logo}>📋</View>
          <Text className={styles.title}>考勤打卡</Text>
          <Text className={styles.subtitle}>智能考勤 · 高效办公</Text>
        </View>
      </View>

      <View className={styles.loginCard}>
        <View className={styles.tabs}>
          <View
            className={classnames(styles.tab, loginType === 'code' && styles.active)}
            onClick={() => setLoginType('code')}
          >
            验证码登录
          </View>
          <View
            className={classnames(styles.tab, loginType === 'password' && styles.active)}
            onClick={() => setLoginType('password')}
          >
            密码登录
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.label}>手机号</Text>
          <View className={classnames(styles.inputWrapper, phoneFocused && styles.focused)}>
            <Text className={styles.inputIcon}>📱</Text>
            <Input
              className={styles.input}
              type="number"
              maxlength={11}
              placeholder="请输入手机号"
              value={phone}
              onInput={(e) => setPhone(e.detail.value)}
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => setPhoneFocused(false)}
            />
          </View>
        </View>

        {loginType === 'code' ? (
          <View className={styles.formGroup}>
            <Text className={styles.label}>验证码</Text>
            <View className={classnames(styles.codeInputWrapper, codeFocused && styles.focused)}>
              <Text className={styles.inputIcon}>🔐</Text>
              <Input
                className={styles.input}
                type="number"
                maxlength={6}
                placeholder="请输入验证码"
                value={code}
                onInput={(e) => setCode(e.detail.value)}
                onFocus={() => setCodeFocused(true)}
                onBlur={() => setCodeFocused(false)}
              />
              <View
                className={classnames(styles.codeBtn, countdown > 0 && styles.disabled)}
                onClick={handleSendCode}
              >
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </View>
            </View>
          </View>
        ) : (
          <View className={styles.formGroup}>
            <Text className={styles.label}>密码</Text>
            <View className={classnames(styles.inputWrapper, passwordFocused && styles.focused)}>
              <Text className={styles.inputIcon}>🔒</Text>
              <Input
                className={styles.input}
                password
                maxlength={20}
                placeholder="请输入密码"
                value={password}
                onInput={(e) => setPassword(e.detail.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
            </View>
          </View>
        )}

        <View
          className={classnames(styles.loginBtn, loading && styles.disabled)}
          onClick={!loading ? handleLogin : undefined}
        >
          {loading ? '登录中...' : '登录'}
        </View>

        {loginType === 'password' && (
          <View className={styles.footer}>
            <Text className={styles.footerLink} onClick={handleForgetPassword}>
              忘记密码？
            </Text>
          </View>
        )}

        <View className={styles.agreement}>
          <View
            className={classnames(styles.checkbox, agreed && styles.checked)}
            onClick={() => setAgreed(!agreed)}
          />
          <Text className={styles.agreementText}>
            我已阅读并同意
            <Text className={styles.agreementLink}> 《用户协议》</Text> 和
            <Text className={styles.agreementLink}> 《隐私政策》</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

export default LoginPage;
