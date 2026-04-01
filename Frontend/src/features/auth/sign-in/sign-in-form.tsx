"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import styles from "./sign-in-form.module.css";

type Notice = {
  type: "success" | "error";
  message: string;
};

const STAFF_ROLES = [
  { value: "doctor", label: "Bác sĩ" },
  { value: "receptionist", label: "Lễ tân" },
  { value: "cashier", label: "Thu ngân" },
] as const;

export function Login() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("patient");
  const [staffRole, setStaffRole] = useState<(typeof STAFF_ROLES)[number]["value"]>(
    "doctor",
  );
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [notice, setNotice] = useState<Notice | null>(null);

  const handleLogin = (e: FormEvent, role: string) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      setNotice({ type: "error", message: "Vui lòng điền đầy đủ thông tin." });
      return;
    }

    setNotice({ type: "success", message: `Đăng nhập thành công với vai trò ${role}.` });

    setTimeout(() => {
      switch (role) {
        case "admin":
          router.push("/admin");
          break;
        case "doctor":
          router.push("/doctor");
          break;
        case "receptionist":
          router.push("/receptionist");
          break;
        case "cashier":
          router.push("/cashier");
          break;
        case "patient":
          router.push("/dashboard");
          break;
        default:
          router.push("/");
      }
    }, 500);
  };

  const updateField = (field: "email" | "password", value: string) => {
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
                  <Label htmlFor="patient-email">Email hoac Số điện thoại</Label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>@</span>
                    <Input
                      id="patient-email"
                      type="text"
                      placeholder="email@example.com hoac 0123456789"
                      className={styles.inputPad}
                      value={loginData.email}
                      onChange={(e) => updateField("email", e.target.value)}
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
                  <Link href="/forgot-password" className={styles.link}>
                    Quên mật khẩu?
                  </Link>
                </div>

                <Button type="submit" className={styles.submitButton}>
                  Đăng nhập
                </Button>

                <div className={styles.centerText}>
                  <span>Chưa có tài khoản? </span>
                  <Link href="/register" className={styles.link}>
                    Đăng ký ngay
                  </Link>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="staff">
              <form onSubmit={(e) => handleLogin(e, staffRole)} className={styles.form}>
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
                  <Label htmlFor="staff-email">Mã nhân viên hoặc Email</Label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>#</span>
                    <Input
                      id="staff-email"
                      type="text"
                      placeholder="NV001 hoặc email@phongkham.vn"
                      className={styles.inputPad}
                      value={loginData.email}
                      onChange={(e) => updateField("email", e.target.value)}
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

                <Button type="submit" className={styles.submitButton}>
                  Đăng nhập
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="admin">
              <form onSubmit={(e) => handleLogin(e, "admin")} className={styles.form}>
                <div className={styles.field}>
                  <Label htmlFor="admin-email">Email quản trị</Label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>@</span>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@phongkham.vn"
                      className={styles.inputPad}
                      value={loginData.email}
                      onChange={(e) => updateField("email", e.target.value)}
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

                <Button type="submit" className={styles.submitButton}>
                  Đăng nhập
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