export interface UserInfo {
  id: string;
  name: string;
  phone: string;
  department: string;
  position: string;
  avatar?: string;
  employeeNo: string;
}

export interface LoginParams {
  phone: string;
  password?: string;
  code?: string;
  loginType: 'password' | 'code';
}

export interface LoginResult {
  token: string;
  userInfo: UserInfo;
}

export interface AuthState {
  token: string | null;
  userInfo: UserInfo | null;
  isLoggedIn: boolean;
}
