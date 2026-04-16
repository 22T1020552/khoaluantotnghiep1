import { clearStoredAuthSession, getStoredAuthSession, saveStoredAuthSession, api } from "./api";
import type {
  AuthResponse,
  AuthSession,
  ForgotPasswordRequest,
  JwtPayload,
  LoginRequest,
  RegisterPatientRequest,
  ResetPasswordWithOtpRequest,
  VerifyForgotPasswordOtpRequest,
} from "@/types/auth";

const normalizeRole = (role: string) => role.toUpperCase();
const PROACTIVE_REFRESH_WINDOW_SECONDS = 60;

// Chuyển phản hồi xác thực từ backend sang định dạng session lưu cục bộ.
const toSession = (response: AuthResponse): AuthSession => ({
  token: response.token,
  refreshToken: response.refreshToken,
  username: response.username,
  role: normalizeRole(response.role),
});

// Giải mã base64 cho cả môi trường trình duyệt và Node.
const decodeBase64 = (value: string) => {
  if (typeof window !== "undefined" && typeof window.atob === "function") {
    return window.atob(value);
  }

  return Buffer.from(value, "base64").toString("utf-8");
};

// Giải mã và parse payload JWT an toàn mà không xác minh chữ ký.
export const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) {
      return null;
    }

    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(decodeBase64(padded)) as JwtPayload;
  } catch {
    return null;
  }
};

// Kiểm tra JWT đã hết hạn hay chưa.
export const isTokenExpired = (token: string) => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return false;
  }

  return Date.now() >= payload.exp * 1000;
};

// Xác định token có cần được làm mới sớm trước khi hết hạn hay không.
const shouldRefreshTokenProactively = (token: string) => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1000 - Date.now() <= PROACTIVE_REFRESH_WINDOW_SECONDS * 1000;
};

// Trả về session lưu trữ hợp lệ, đồng thời xóa nếu token đã hết hạn.
export const getCurrentAuthSession = (): AuthSession | null => {
  const stored = getStoredAuthSession();
  if (!stored) {
    return null;
  }

  if (isTokenExpired(stored.token)) {
    clearStoredAuthSession();
    return null;
  }
  return stored;
};

export const authService = {
  // Làm mới access token bằng refresh token và cập nhật lưu trữ cục bộ.
  async refreshSession() {
    const stored = getStoredAuthSession();
    const refreshToken = stored?.refreshToken;

    if (!refreshToken) {
      clearStoredAuthSession();
      return null;
    }

    const response = await api.post<AuthResponse>("/api/auth/refresh", { refreshToken });
    const session = toSession(response.data);
    saveStoredAuthSession(session);
    return session;
  },

  // Khởi tạo session ứng dụng và chủ động làm mới khi cần.
  async initializeSession() {
    const stored = getStoredAuthSession();
    if (!stored) {
      return null;
    }

    if (shouldRefreshTokenProactively(stored.token)) {
      try {
        return await this.refreshSession();
      } catch {
        clearStoredAuthSession();
        return null;
      }
    }

    return stored;
  },

  // Đăng nhập người dùng và lưu các token session trả về.
  async login(payload: LoginRequest) {
    const response = await api.post<AuthResponse>("/api/auth/login", payload);
    const session = toSession(response.data);
    saveStoredAuthSession(session);
    return session;
  },

  // Đăng ký tài khoản bệnh nhân mới và lưu session khi thành công.
  async registerPatient(payload: RegisterPatientRequest) {
    const response = await api.post<AuthResponse>("/api/auth/register/patient", payload);
    const session = toSession(response.data);
    saveStoredAuthSession(session);
    return session;
  },

  // Yêu cầu gửi OTP cho quy trình quên mật khẩu.
  async sendForgotPasswordOtp(payload: ForgotPasswordRequest) {
    const response = await api.post<string>("/api/auth/forgot-password/send-otp", payload);
    return response.data;
  },

  // Xác thực OTP trong quy trình quên mật khẩu.
  async verifyForgotPasswordOtp(payload: VerifyForgotPasswordOtpRequest) {
    const response = await api.post<string>("/api/auth/forgot-password/verify-otp", payload);
    return response.data;
  },

  // Đặt lại mật khẩu bằng OTP đã được xác thực.
  async resetPasswordWithOtp(payload: ResetPasswordWithOtpRequest) {
    const response = await api.post<string>("/api/auth/forgot-password/reset", payload);
    return response.data;
  },

  // Đăng xuất phía server nếu có thể và luôn xóa session cục bộ.
  async logout() {
    const stored = getStoredAuthSession();
    const refreshToken = stored?.refreshToken;

    if (refreshToken) {
      try {
        await api.post<string>("/api/auth/logout", { refreshToken });
      } catch {
        // Đăng xuất phải ổn định ngay cả khi token đã không hợp lệ hoặc lỗi mạng.
      }
    }

    clearStoredAuthSession();
  },
};
