'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, User, CreditCard, FileText } from "lucide-react";
import { toast } from "sonner";
import styles from "../booking.module.css";

// Định nghĩa props để truyền sự kiện ra ngoài component cha
interface BookingFormProps {
  onSuccess: () => void;
}

export function BookingForm({ onSuccess }: BookingFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    hometown: "",
    phone: "",
    idNumber: "",
    insuranceNumber: "",
    reason: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.dateOfBirth || !formData.phone || !formData.reason) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    // Ở tuần 3, bạn sẽ gọi API ở đây: await appointmentService.create(...)
    
    // Báo ra ngoài Component Cha là đã thành công
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Thông tin cá nhân */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <User className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Thông tin cá nhân</h2>
        </div>
        <div className={styles.grid}>
          <div className={styles.fullWidth}>
            <Label htmlFor="fullName">Họ và tên <span className={styles.required}>*</span></Label>
            <Input id="fullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="Nguyễn Văn A" required />
          </div>
          <div>
            <Label htmlFor="dateOfBirth">Ngày sinh <span className={styles.required}>*</span></Label>
            <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="phone">Số điện thoại <span className={styles.required}>*</span></Label>
            <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="0123456789" required />
          </div>
          <div className={styles.fullWidth}>
            <Label htmlFor="hometown">Quê quán</Label>
            <Input id="hometown" value={formData.hometown} onChange={(e) => setFormData({ ...formData, hometown: e.target.value })} placeholder="Thành phố, Tỉnh" />
          </div>
        </div>
      </div>

      {/* Giấy tờ tùy thân */}
      <div className={styles.sectionDivider}>
        <div className={styles.sectionHeader}>
          <CreditCard className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Giấy tờ tùy thân</h2>
        </div>
        <div className={styles.grid}>
          <div>
            <Label htmlFor="idNumber">Số CCCD/CMND</Label>
            <Input id="idNumber" value={formData.idNumber} onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })} placeholder="001234567890" />
          </div>
          <div>
            <Label htmlFor="insuranceNumber">Số thẻ BHYT</Label>
            <Input id="insuranceNumber" value={formData.insuranceNumber} onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })} placeholder="DN1234567890123" />
          </div>
        </div>
      </div>

      {/* Lý do khám */}
      <div className={styles.sectionDivider}>
        <div className={styles.sectionHeader}>
          <FileText className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Thông tin khám bệnh</h2>
        </div>
        <div>
          <Label htmlFor="reason">Lý do khám / Triệu chứng <span className={styles.required}>*</span></Label>
          <Textarea id="reason" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Mô tả triệu chứng..." rows={4} required />
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="submit" className={styles.submitBtn} size="lg">
          <Calendar className="w-5 h-5 mr-2" />
          Đặt lịch khám
        </Button>
      </div>
    </form>
  );
}