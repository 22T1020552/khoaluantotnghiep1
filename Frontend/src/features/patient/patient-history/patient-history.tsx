'use client';

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Stethoscope, Pill, FileText, Activity, LogOut, Link, LayoutDashboard } from "lucide-react";
import styles from "./patient-history.module.css";
import { MedicalRecord } from "@/types/record.type"; 

const mockRecords: MedicalRecord[] = [
  {
    id: 101,
    appointment_id: 1,
    diagnosis: "Viêm họng cấp",
    doctor_advice: "Kháng sinh + viên ngậm, nghỉ ngơi nhiều, uống nước ấm",
    created_at: "2026-03-20T10:00:00",
    appointment: {
      // Giả sử appointment có chứa thông tin bác sĩ
      id: 1,
      doctor: { full_name: "BS. Nguyễn Văn Hùng" }
    } as any,
    prescriptionDetails: [
      {
        medicine: { medicine_name: "Amoxicillin 500mg", selling_price: 2000 },
        quantity: 15,
        usage_instructions: "3 viên/ngày x 5 ngày",
      } as any,
      {
        medicine: { medicine_name: "Strepsils", selling_price: 3000 },
        quantity: 10,
        usage_instructions: "Ngậm khi đau",
      } as any,
    ],
    services: [
      {
        service: { service_name: "Khám nội chung", current_price: 150000 }
      } as any
    ]
  }
];

export function PatientHistory() {
  
  // Hàm phụ trợ: Tính tổng tiền (Tiền dịch vụ + Tiền thuốc)
  const calculateTotalCost = (record: MedicalRecord) => {
    let total = 0;
    // Cộng tiền dịch vụ
    if (record.services) {
      total += record.services.reduce((sum, s) => sum + (s.service?.current_price || 0), 0);
    }
    // Cộng tiền thuốc
    if (record.prescriptionDetails) {
      total += record.prescriptionDetails.reduce((sum, p) => sum + ((p.medicine?.selling_price || 0) * p.quantity), 0);
    }
    return total;
  };

  return (
    <div className={styles.container}>
      
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Lịch sử khám bệnh</h1>
        <p className={styles.subtitle}>Xem lại hồ sơ bệnh án và đơn thuốc</p>
      </div>

      {/* Thông tin bệnh nhân */}
      <Card className={styles.patientCard}>
        <div className={styles.patientFlex}>
          <div className={styles.avatar}>BN</div>
          <div className={styles.patientInfo}>
            <h3 className={styles.patientName}>Thông tin bệnh nhân</h3>
            <div className={styles.infoGrid}>
              <div>
                <span className={styles.infoLabel}>Họ tên:</span>
                <span className={styles.infoValue}>Nguyễn Văn A</span>
              </div>
              <div>
                <span className={styles.infoLabel}>Ngày sinh:</span>
                <span className={styles.infoValue}>15/05/1990</span>
              </div>
              <div>
                <span className={styles.infoLabel}>SĐT:</span>
                <span className={styles.infoValue}>0123456789</span>
              </div>
              <div>
                <span className={styles.infoLabel}>Mã BHYT:</span>
                <span className={styles.infoValue}>DN1234567890123</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Danh sách Hồ sơ bệnh án */}
      <div>
        <h2 className={styles.sectionTitle}>Hồ sơ khám bệnh ({mockRecords.length})</h2>
        
        {mockRecords.map((record) => (
          <Card key={record.id} className={styles.recordCard}>
            
            {/* Record Header */}
            <div className={styles.recordHeader}>
              <div className={styles.recordLeft}>
                <div className={styles.recordIcon}>
                  <FileText size={24} />
                </div>
                <div>
                  <div className={styles.badgeGroup}>
                    <Badge variant="secondary" className={styles.customBadge}>
                      <Calendar size={12} style={{ marginRight: '4px' }} />
                      {/* Format ngày tạo bệnh án */}
                      {new Date(record.created_at).toLocaleDateString("vi-VN")} 
                    </Badge>
                    <Badge variant="secondary" className={styles.customBadge}>
                      <Stethoscope size={12} style={{ marginRight: '4px' }} />
                      {/* Lấy tên bác sĩ từ appointment */}
                      {record.appointment?.doctor?.username || "Chưa cập nhật"}
                    </Badge>
                  </div>
                  <p className={styles.recordId}>Mã hồ sơ: #{record.id}</p>
                </div>
              </div>
              <div className={styles.costRight}>
                <p className={styles.costLabel}>Tổng chi phí</p>
                <p className={styles.costValue}>
                  {calculateTotalCost(record).toLocaleString("vi-VN")}đ
                </p>
              </div>
            </div>

            {/* Record Details */}
            <div className={styles.detailsContainer}>
              
              <div className={`${styles.block} ${styles.blockBlue}`}>
                <p className={styles.blockTitleBlue}>Chẩn đoán:</p>
                <p className={styles.blockTextBlue}>{record.diagnosis}</p>
              </div>

              <div className={`${styles.block} ${styles.blockGreen}`}>
                <p className={styles.blockTitleGreen}>Lời khuyên / Điều trị:</p>
                {/* Đổi từ treatment sang doctor_advice */}
                <p className={styles.blockTextGreen}>{record.doctor_advice}</p> 
              </div>

              {/* Danh sách Dịch vụ khám (Mới thêm dựa theo Interface của bạn) */}
              {record.services && record.services.length > 0 && (
                <div className={`${styles.block} ${styles.blockBlue}`} style={{ backgroundColor: '#f0f9ff' }}>
                  <div className={styles.blockTitleBlue} style={{ color: '#0369a1' }}>
                    <Activity size={16} /> Dịch vụ cận lâm sàng:
                  </div>
                  <ul className={styles.medList} style={{ color: '#0ea5e9' }}>
                    {record.services.map((srv, idx) => (
                      <li key={idx}>
                        {srv.service?.service_name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Danh sách Thuốc */}
              {record.prescriptionDetails && record.prescriptionDetails.length > 0 && (
                <div className={`${styles.block} ${styles.blockPurple}`}>
                  <div className={styles.blockTitlePurple}>
                    <Pill size={16} /> Đơn thuốc:
                  </div>
                  <ul className={styles.medList}>
                    {/* Map từ mảng prescriptionDetails ra hiển thị */}
                    {record.prescriptionDetails.map((detail, idx) => (
                      <li key={idx}>
                        <span style={{ fontWeight: 500 }}>{detail.medicine?.medicine_name}</span> 
                        {' - Số lượng: '}{detail.quantity}
                        {' - Cách dùng: '}{detail.usage_instructions}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </Card>
        ))}

        {/* Empty State */}
        {mockRecords.length === 0 && (
          <Card className={styles.emptyState}>
            <FileText size={48} color="#d1d5db" />
            <p>Chưa có hồ sơ khám bệnh</p>
          </Card>
        )}
        
      </div>
    </div>
  );
}