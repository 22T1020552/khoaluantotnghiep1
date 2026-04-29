'use client';

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/services/api";
import { patientService } from "@/services/patientService";
import { Calendar, CreditCard, FileText, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import styles from "../booking.module.css";

// Định nghĩa props để truyền sự kiện ra ngoài component cha
interface BookingFormProps {
  onSuccess: (appointmentId: number) => void;
}
<<<<<<< HEAD

=======
//Hàm chuẩn hóa thời gian để backend hiểu được
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
const toApiDateTime = (value: string) => {
  const normalized = value.trim();
  if (!normalized) {
    return normalized;
  }

<<<<<<< HEAD
  // Backend expects LocalDateTime in yyyy-MM-dd'T'HH:mm:ss.
=======
  // Backend: yyyy-MM-dd'T'HH:mm:ss.
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
  if (normalized.length === 16) {
    return `${normalized}:00`;
  }

  return normalized;
};

export function BookingForm({ onSuccess }: BookingFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
<<<<<<< HEAD
=======
    gender: "",
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
    dateOfBirth: "",
    hometown: "",
    phone: "",
    idNumber: "",
    insuranceNumber: "",
    appointmentTime: "",
    reason: "",
  });

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
<<<<<<< HEAD
        const profile = await patientService.getProfile();
        if (!isMounted) {
          return;
        }

        setFormData((prev) => ({
          ...prev,
          fullName: profile.fullName ?? "",
=======
        const profile = await patientService.getProfile(); //Lấy thông tin của mình
        if (!isMounted) {
          return;
        }
        // Điền thông tin vào form nếu có
        setFormData((prev) => ({
          ...prev,
          fullName: profile.fullName ?? "",
          gender: profile.gender ?? "",
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
          phone: profile.phoneNumber ?? "",
          idNumber: profile.nationalId ?? "",
          insuranceNumber: profile.healthInsuranceNumber ?? "",
        }));
      } catch {
        // Do not block form usage when profile API fails.
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedReason = formData.reason.trim();

<<<<<<< HEAD
    if (!formData.fullName || !formData.dateOfBirth || !formData.phone || !formData.reason || !formData.appointmentTime) {
=======
    if (!formData.fullName || !formData.gender || !formData.dateOfBirth || !formData.phone || !formData.reason || !formData.appointmentTime) {
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (normalizedReason.length < 5) {
      toast.error("Lý do khám cần tối thiểu 5 ký tự");
      return;
    }
<<<<<<< HEAD

=======
    //Gói dữ liệu và gửi lên backend
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
    try {
      setSubmitting(true);
      const createdAppointment = await patientService.createAppointment({
        appointmentTime: toApiDateTime(formData.appointmentTime),
        symptoms: normalizedReason,
      });
<<<<<<< HEAD

=======
      // Gọi callback để thông báo cho component cha biết đã tạo thành công và truyền ID của lịch hẹn mới tạo
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
      onSuccess(createdAppointment.id);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể đặt lịch khám"));
    } finally {
      setSubmitting(false);
    }
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
<<<<<<< HEAD
=======
            <Label htmlFor="gender">Giới tính <span className={styles.required}>*</span></Label>
            <select
              id="gender"
              className={styles.selectInput}
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              required
            >
              <option value="">-- Chọn giới tính --</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <div>
>>>>>>> 7db75c0f9435daf86f2f483deffbd38c81a426f6
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
        <div className={styles.fieldGroup}>
          <Label htmlFor="appointmentTime" className={styles.fieldLabel}>
            Thời gian hẹn <span className={styles.required}>*</span>
          </Label>
          <Input
            id="appointmentTime"
            type="datetime-local"
            value={formData.appointmentTime}
            onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
            required
          />
        </div>
        <div className={styles.fieldGroup}>
          <Label htmlFor="reason" className={styles.fieldLabel}>
            Lý do khám / Triệu chứng <span className={styles.required}>*</span>
          </Label>
          <Textarea
            id="reason"
            className={styles.reasonTextarea}
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Mô tả triệu chứng..."
            rows={4}
            required
          />
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="submit" className={styles.submitBtn} size="lg" disabled={submitting}>
          {submitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Calendar className="w-5 h-5 mr-2" />}
          {submitting ? "Đang gửi..." : "Đặt lịch khám"}
        </Button>
      </div>
    </form>
  );
}