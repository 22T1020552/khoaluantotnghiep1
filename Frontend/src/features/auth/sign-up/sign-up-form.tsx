"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, Phone, Calendar } from "lucide-react";

import styles from "../sign-in/sign-in-form.module.css";

type Notice = {
  type: "success" | "error";
  message: string;
};

export function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [notice, setNotice] = useState<Notice | null>(null);

  const handleRegister = (e: FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.fullName ||
      !formData.dateOfBirth ||
      !formData.phone ||
      !formData.email ||
      !formData.password
    ) {
      setNotice({ type: "error", message: "Vui lòng điền đầy đủ thông tin." });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setNotice({ type: "error", message: "Mật khẩu xác nhận không khớp." });
      return;
    }

    if (formData.password.length < 6) {
      setNotice({ type: "error", message: "Mật khẩu phải có ít nhất 6 ký tự." });
      return;
    }

    // Mock registration
    setNotice({ type: "success", message: "Đăng ký tài khoản thành công!" });
    
    setTimeout(() => {
      router.push("/signin");
    }, 1000);
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
          <p className={styles.subtitle}>Đăng ký tài khoản bệnh nhân.</p>
        </div>

        <Card className={styles.card}>
          <form onSubmit={handleRegister} className={styles.form}>
            
            <div className={styles.field}>
              <Label htmlFor="fullName">
                Họ và tên <span className="text-red-500">*</span>
              </Label>
              <div className={styles.inputWrap}>
                <User className={styles.inputIcon} size={18} />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  className={styles.inputPad}
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <Label htmlFor="dateOfBirth">
                Ngày sinh <span className="text-red-500">*</span>
              </Label>
              <div className={styles.inputWrap}>
                <Calendar className={styles.inputIcon} size={18} />
                <Input
                  id="dateOfBirth"
                  type="date"
                  className={styles.inputPad}
                  value={formData.dateOfBirth}
                  onChange={(e) => updateField("dateOfBirth", e.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <Label htmlFor="phone">
                Số điện thoại <span className="text-red-500">*</span>
              </Label>
              <div className={styles.inputWrap}>
                <Phone className={styles.inputIcon} size={18} />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0123456789"
                  className={styles.inputPad}
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <div className={styles.inputWrap}>
                <Mail className={styles.inputIcon} size={18} />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  className={styles.inputPad}
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <Label htmlFor="password">
                Mật khẩu <span className="text-red-500">*</span>
              </Label>
              <div className={styles.inputWrap}>
                <Lock className={styles.inputIcon} size={18} />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className={styles.inputPad}
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <Label htmlFor="confirmPassword">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </Label>
              <div className={styles.inputWrap}>
                <Lock className={styles.inputIcon} size={18} />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className={styles.inputPad}
                  value={formData.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                />
              </div>
            </div>

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

            <Button type="submit" className={styles.submitButton}>
              Đăng ký
            </Button>

            <div className={styles.centerText}>
              <span>Đã có tài khoản? </span>
              <Link href="/login" className={styles.link}>
                Đăng nhập ngay
              </Link>
            </div>
          </form>
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