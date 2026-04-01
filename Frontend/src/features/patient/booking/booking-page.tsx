'use client';

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { BookingForm } from "./components/booking-form"; // Import form vào đây
import styles from "./booking.module.css";

export function BookingPageContent() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Hàm này sẽ được truyền vào BookingForm
  const handleBookingSuccess = () => {
    setIsSubmitted(true);
    toast.success("Đặt lịch khám thành công!");

    // Sau 3 giây, tắt màn hình thành công, quay lại form trống
    setTimeout(() => {
      setIsSubmitted(false);
    }, 3000);
  };

  // Nếu đã submit, chỉ hiện thị Card Thành Công
  if (isSubmitted) {
    return (
      <div className={styles.centerContainer}>
        <Card className={styles.successCard}>
          <div className={styles.iconWrapper}>
            <CheckCircle className={styles.iconSuccess} />
          </div>
          <h2 className={styles.successTitle}>Đặt lịch thành công!</h2>
          <p className={styles.successText}>Cảm ơn bạn đã đặt lịch khám tại phòng khám của chúng tôi.</p>
          <p className={styles.successSubtext}>Lễ tân sẽ liên hệ với bạn sớm nhất để xác nhận lịch hẹn.</p>
        </Card>
      </div>
    );
  }

  // Mặc định hiện thị Layout chứa BookingForm
  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>Đặt lịch khám bệnh</h1>
          <p className={styles.subtitle}>Vui lòng điền đầy đủ thông tin để đặt lịch khám</p>
        </div>

        <Card className={styles.cardForm}>
          {/* Nhúng form vào và lắng nghe sự kiện onSuccess */}
          <BookingForm onSuccess={handleBookingSuccess} />
        </Card>

        <div className={styles.footer}>
          <p>Lưu ý: Các trường có dấu (*) là bắt buộc</p>
        </div>
      </div>
    </div>
  );
}