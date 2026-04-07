package com.example.demo.service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.entity.Appointment;
import com.example.demo.entity.Patient;
import com.example.demo.entity.Role;
import com.example.demo.entity.Room;
import com.example.demo.entity.User;
import com.example.demo.repository.RoomRepository;
import com.example.demo.repository.UserRepository;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(NotificationService.class);
    private static final DateTimeFormatter APPOINTMENT_TIME_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final JavaMailSender mailSender;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;

    @Value("${clinic.notification.receptionist.emails:}")
    private String receptionistNotificationEmails;

    @Value("${spring.mail.username:}")
    private String senderEmail;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @PostConstruct
    public void logMailConfigurationAtStartup() {
        String from = senderEmail == null ? "" : senderEmail.trim();
        String configuredRecipients = receptionistNotificationEmails == null ? ""
                : receptionistNotificationEmails.trim();
        LOGGER.info(
                "Mail notification config at startup: senderConfigured={}, configuredRecipients='{}'",
                !from.isBlank(),
                configuredRecipients);
    }

    // Chức năng:Thông báo cho bệnh nhân về việc hủy lịch khám.
    public void notifyClinicCancelledAppointment(Appointment appointment, String cancellationReason) {
        Patient patient = appointment.getPatient();
        String recipient = patient == null || patient.getGmail() == null ? "" : patient.getGmail().trim();
        if (!isValidEmail(recipient)) {
            LOGGER.warn(
                    "Bỏ qua gửi email hủy lịch do phòng khám vì email bệnh nhân thiếu/không hợp lệ: appointmentId={}",
                    appointment.getId());
            return;
        }

        String from = senderEmail == null ? "" : senderEmail.trim();
        if (from.isBlank()) {
            LOGGER.warn("Skip clinic-cancelled appointment email because spring.mail.username is empty");
            return;
        }

        String patientName = patient.getFullName() == null || patient.getFullName().isBlank()
                ? "Quy khach"
                : patient.getFullName().trim();
        String appointmentTime = appointment.getAppointmentTime() == null
                ? "Không có"
                : appointment.getAppointmentTime().format(APPOINTMENT_TIME_FORMAT);
        String reason = (cancellationReason == null || cancellationReason.isBlank())
                ? "Phong kham can dieu chinh lich tiep nhan"
                : cancellationReason.trim();

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(recipient);
        message.setSubject("[Phong kham] Lich kham cua ban da bi tu choi");
        message.setText("""
                Xin chao %s,

                Rat tiec, lich kham cua ban chua the duoc tiep nhan.
                - Ma lich hen: %s
                - Thoi gian du kien: %s
                - Ly do tu choi: %s

                Mong ban thong cam va hen gap lai ban o lan kham sau.
                Vui long dat lich moi hoac lien he le tan de duoc ho tro.
                """.formatted(
                patientName,
                appointment.getId(),
                appointmentTime,
                reason));

        try {
            mailSender.send(message);
            LOGGER.info("Sent clinic-cancelled appointment email: appointmentId={}, recipient={}", appointment.getId(),
                    recipient);
        } catch (MailException ex) {
            LOGGER.error(
                    "Failed to send clinic-cancelled appointment email: appointmentId={}, recipient={}, error={}",
                    appointment.getId(),
                    recipient,
                    ex.getMessage(),
                    ex);
        }
    }

    // Chức năng: thông báo cho bệnh nhân khi lịch khám được chấp nhận.
    public void notifyAppointmentApproved(Appointment appointment) {
        Patient patient = appointment.getPatient();
        String recipient = patient == null || patient.getGmail() == null ? "" : patient.getGmail().trim();
        if (!isValidEmail(recipient)) {
            LOGGER.warn("Bỏ qua gửi email duyệt lịch vì email bệnh nhân thiếu/không hợp lệ: appointmentId={}",
                    appointment.getId());
            return;
        }

        String from = senderEmail == null ? "" : senderEmail.trim();
        if (from.isBlank()) {
            LOGGER.warn("Skip approved appointment email because spring.mail.username is empty");
            return;
        }

        String patientName = patient.getFullName() == null || patient.getFullName().isBlank()
                ? "Quy khach"
                : patient.getFullName().trim();
        String appointmentTime = appointment.getAppointmentTime() == null
                ? "Không có"
                : appointment.getAppointmentTime().format(APPOINTMENT_TIME_FORMAT);
        User doctor = appointment.getDoctor();
        String doctorName = doctor == null || doctor.getUsername() == null || doctor.getUsername().isBlank()
                ? "Không có"
                : doctor.getUsername().trim();
        String roomName = resolveRoomName(doctor == null ? null : doctor.getId());

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(recipient);
        message.setSubject("[Phong kham] Lich kham cua ban da duoc chap nhan");
        message.setText("""
                Xin chao %s,

                Lich kham cua ban da duoc chap nhan.
                - Ma lich hen: %s
                - Ngay gio kham: %s
                - Phong kham: %s
                - Bac si phu trach: %s

                Vui long den som 10-15 phut de lam thu tuc. Hen gap lai ban tai phong kham.
                """.formatted(
                patientName,
                appointment.getId(),
                appointmentTime,
                roomName,
                doctorName));

        try {
            mailSender.send(message);
            LOGGER.info("Sent approved appointment email: appointmentId={}, recipient={}", appointment.getId(),
                    recipient);
        } catch (MailException ex) {
            LOGGER.error(
                    "Failed to send approved appointment email: appointmentId={}, recipient={}, error={}",
                    appointment.getId(),
                    recipient,
                    ex.getMessage(),
                    ex);
        }
    }

    // Chức năng: gửi email cho lễ tân khi có bệnh nhân mới đặt lịch.
    public void notifyReceptionistNewPatientBooking(Appointment appointment) {
        List<String> recipients = resolveReceptionistRecipients();
        LOGGER.info(
                "Preparing receptionist booking email: appointmentId={}, recipientCount={}, configuredRecipients='{}'",
                appointment.getId(),
                recipients.size(),
                receptionistNotificationEmails);
        if (recipients.isEmpty()) {
            LOGGER.warn("Skip receptionist booking email because no recipient was configured");
            return;
        }

        String from = senderEmail == null ? "" : senderEmail.trim();
        if (from.isBlank()) {
            LOGGER.warn("Skip receptionist booking email because spring.mail.username is empty");
            return;
        }

        String appointmentTime = appointment.getAppointmentTime() == null
                ? "Không có"
                : appointment.getAppointmentTime().format(APPOINTMENT_TIME_FORMAT);
        Patient patient = appointment.getPatient();
        String patientName = patient == null || patient.getFullName() == null ? "Không có" : patient.getFullName();
        String patientPhone = patient == null || patient.getPhoneNumber() == null ? "Không có"
                : patient.getPhoneNumber();
        String symptoms = appointment.getSymptoms() == null || appointment.getSymptoms().isBlank()
                ? "Không có"
                : appointment.getSymptoms().trim();

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(recipients.toArray(String[]::new));
        message.setSubject("[Phong kham] Co benh nhan moi dat lich");
        message.setText("""
                Le tan co lich hen moi:
                - Ma lich hen: %s
                - Ten benh nhan: %s
                - So dien thoai: %s
                - Thoi gian hen: %s
                - Trieu chung: %s
                - Trang thai: %s
                """.formatted(
                appointment.getId(),
                patientName,
                patientPhone,
                appointmentTime,
                symptoms,
                appointment.getStatus()));

        try {
            mailSender.send(message);
            LOGGER.info("Sent receptionist booking email: appointmentId={}, recipients={}", appointment.getId(),
                    recipients);
        } catch (MailException ex) {
            LOGGER.error(
                    "Failed to send receptionist booking email: appointmentId={}, recipients={}, error={}",
                    appointment.getId(),
                    recipients,
                    ex.getMessage(),
                    ex);
        }
    }

    // Chức năng: gửi OTP cho luồng quên mật khẩu qua email.
    public void sendForgotPasswordOtp(String recipientEmail, String otp) {
        String to = recipientEmail == null ? "" : recipientEmail.trim();
        if (to.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email là bắt buộc");
        }

        String from = senderEmail == null ? "" : senderEmail.trim();
        if (from.isBlank()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Chưa cấu hình địa chỉ gửi mail");
        }

        String host = mailHost == null ? "" : mailHost.trim();
        if (host.isBlank()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Chưa cấu hình máy chủ mail");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject("[Phòng khám] Mã OTP đặt lại mật khẩu");
        message.setText("""
                Xin chào,

                Mã OTP để đặt lại mật khẩu của bạn là: %s
                Mã này có hiệu lực trong 10 phút.

                Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
                    """.formatted(otp));

        try {
            mailSender.send(message);
            LOGGER.info("Sent forgot-password OTP email: recipient={}", to);
        } catch (MailException ex) {
            LOGGER.error("Failed to send forgot-password OTP email: recipient={}, error={}", to, ex.getMessage(), ex);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Hiện không thể gửi email OTP");
        }
    }

    private List<String> resolveReceptionistRecipients() {
        Set<String> recipients = new LinkedHashSet<>();

        for (String configuredEmail : splitConfiguredEmails()) {
            if (isValidEmail(configuredEmail)) {
                recipients.add(configuredEmail);
            }
        }

        List<User> receptionists = userRepository.findByRole(Role.RECEPTIONIST);
        for (User receptionist : receptionists) {
            String username = receptionist.getUsername();
            if (isValidEmail(username)) {
                recipients.add(username.trim());
            }
        }

        return new ArrayList<>(recipients);
    }

    private List<String> splitConfiguredEmails() {
        if (receptionistNotificationEmails == null || receptionistNotificationEmails.isBlank()) {
            return List.of();
        }

        String[] parts = receptionistNotificationEmails.split(",");
        List<String> result = new ArrayList<>();
        for (String part : parts) {
            if (part != null && !part.isBlank()) {
                result.add(part.trim());
            }
        }
        return result;
    }

    private boolean isValidEmail(String value) {
        if (value == null) {
            return false;
        }
        String email = value.trim();
        int atIndex = email.indexOf('@');
        int lastDotIndex = email.lastIndexOf('.');
        return atIndex > 0 && lastDotIndex > atIndex + 1 && lastDotIndex < email.length() - 1;
    }

    private String resolveRoomName(Long doctorUserId) {
        if (doctorUserId == null) {
            return "Không có";
        }

        List<Room> rooms = roomRepository.findByCurrentDoctor_Id(doctorUserId);
        if (rooms.isEmpty()) {
            return "Không có";
        }

        String roomName = rooms.get(0).getRoomName();
        return roomName == null || roomName.isBlank() ? "Không có" : roomName.trim();
    }
}