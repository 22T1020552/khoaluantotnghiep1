"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/services/api";

import styles from "./sign-in-form.module.css";

type Notice = {
  type: "success" | "error";
  message: string;
};

const ROLE_ROUTES: Record<string, string> = {
  ADMIN: "/admin",
  DOCTOR: "/doctor",
  RECEPTIONIST: "/receptionist",
  CASHIER: "/cashier",
  PATIENT: "/dashboard",
};

const STAFF_ROLES = [
  { value: "doctor", label: "Bác sĩ" },
  { value: "receptionist", label: "Lễ tân" },
  { value: "cashier", label: "Thu ngân" },
] as const;

export function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState("patient");
  const [staffRole, setStaffRole] = useState<(typeof STAFF_ROLES)[number]["value"]>("doctor");
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: FormEvent, selectedTab: string) => {
    e.preventDefault();

    if (!loginData.username.trim() || !loginData.password) {
      setNotice({ type: "error", message: "Vui lòng điền đầy đủ thông tin." });
      return;
    }

    setIsSubmitting(true);
    try {
      const auth = await login({
        username: loginData.username.trim(),
        password: loginData.password,
      });

      const nextRole = String(auth.role).toUpperCase();
      const nextPath = ROLE_ROUTES[nextRole] ?? "/";
      const selectedLabel =
        selectedTab === "staff"
          ? STAFF_ROLES.find((role) => role.value === staffRole)?.label ?? "Nhân viên"
          : selectedTab === "admin"
            ? "Quản trị viên"
            : "Bệnh nhân";

      setNotice({
        type: "success",
        message: `Đăng nhập thành công cho ${selectedLabel}.`,
      });

      window.setTimeout(() => {
        router.push(nextPath);
      }, 400);
    } catch (error) {
      setNotice({
        type: "error",
        message: getApiErrorMessage(error, "Đăng nhập thất bại. Kiểm tra lại username và mật khẩu."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: "username" | "password", value: string) => {
    setLoginData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className={styles.page}>
      <div className={styles.wrapper}>
        <div className={styles.brandBlock}>
          <div className={styles.brandRow}>
            <div className={styles.brandIcon} aria-hidden="true">
              +
            </div>
            <h1 className={styles.title}>Phòng Khám Đa Khoa</h1>
          </div>
          <p className={styles.subtitle}>Đăng nhập vào hệ thống quản lý.</p>
        </div>

        <Card className={styles.card}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={styles.tabList}>
              <TabsTrigger className={styles.tabTrigger} value="patient">
                Bệnh nhân
              </TabsTrigger>
              <TabsTrigger className={styles.tabTrigger} value="staff">
                Nhân viên
              </TabsTrigger>
              <TabsTrigger className={styles.tabTrigger} value="admin">
                Quản trị viên
              </TabsTrigger>
            </TabsList>

            <TabsContent value="patient">
              <form onSubmit={(e) => handleLogin(e, "patient")} className={styles.form}>
                <div className={styles.field}>
                  <Label htmlFor="patient-username">Tên đăng nhập</Label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>@</span>
                    <Input
                      id="patient-username"
                      type="text"
                      placeholder="nguyenvana"
                      className={styles.inputPad}
                      value={loginData.username}
                      onChange={(e) => updateField("username", e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <Label htmlFor="patient-password">Mật khẩu</Label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>*</span>
                    <Input
                      id="patient-password"
                      type="password"
                      placeholder="••••••••"
                      className={styles.inputPad}
                      value={loginData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.inlineRow}>
                  <label className={styles.checkRow}>
                    <input type="checkbox" className={styles.checkbox} />
                    <span>Ghi nhớ đăng nhập</span>
                  </label>
                  <Link href="/forgotpassword" className={styles.link}>
                    Quên mật khẩu?
                  </Link>
                </div>

                <Button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                  {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>

                <div className={styles.centerText}>
                  <span>Chưa có tài khoản? </span>
                  <Link href="/signup" className={styles.link}>
                    Đăng ký ngay
                  </Link>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="staff">
              <form onSubmit={(e) => handleLogin(e, "staff")} className={styles.form}>
                <div className={styles.field}>
                  <Label>Chọn vai trò</Label>
                  <div className={styles.roleGrid}>
                    {STAFF_ROLES.map((role) => (
                      <Button
                        key={role.value}
                        type="button"
                        variant={staffRole === role.value ? "default" : "outline"}
                        size="sm"
                        className={styles.roleButton}
                        onClick={() => setStaffRole(role.value)}
                      >
                        {role.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className={styles.field}>
                  <Label htmlFor="staff-username">Tên đăng nhập</Label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>#</span>
                    <Input
                      id="staff-username"
                      type="text"
                      placeholder="nv001"
                      className={styles.inputPad}
                      value={loginData.username}
                      onChange={(e) => updateField("username", e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <Label htmlFor="staff-password">Mật khẩu</Label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>*</span>
                    <Input
                      id="staff-password"
                      type="password"
                      placeholder="••••••••"
                      className={styles.inputPad}
                      value={loginData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                    />
                  </div>
                </div>

                <Button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                  {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="admin">
              <form onSubmit={(e) => handleLogin(e, "admin")} className={styles.form}>
                <div className={styles.field}>
                  <Label htmlFor="admin-username">Tên đăng nhập quản trị</Label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>@</span>
                    <Input
                      id="admin-username"
                      type="text"
                      placeholder="admin01"
                      className={styles.inputPad}
                      value={loginData.username}
                      onChange={(e) => updateField("username", e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <Label htmlFor="admin-password">Mật khẩu</Label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>*</span>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="••••••••"
                      className={styles.inputPad}
                      value={loginData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                    />
                  </div>
                </div>

                <Button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                  {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {notice && (
            <p
              className={
                notice.type === "error"
                  ? `${styles.notice} ${styles.noticeError}`
                  : `${styles.notice} ${styles.noticeSuccess}`
              }
            >
              {notice.message}
            </p>
          )}
        </Card>

        <div className={styles.backHome}>
          <Link href="/" className={styles.homeLink}>
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}