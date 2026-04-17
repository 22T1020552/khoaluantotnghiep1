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
import com.example.demo.exception.AppException;

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
                "Cấu hình thông báo email khi khởi động: đã cấu hình người gửi={}, danh sách người nhận='{}'",
                !from.isBlank(),
                configuredRecipients);
    }

    // Chức năng: thông báo cho bệnh nhân về việc hủy lịch khám.
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
            LOGGER.warn("Bỏ qua gửi email hủy lịch do phòng khám vì spring.mail.username đang trống");
            return;
        }

        String patientName = patient.getFullName() == null || patient.getFullName().isBlank()
                ? "Quý khách"
                : patient.getFullName().trim();
        String appointmentTime = appointment.getAppointmentTime() == null
                ? "Không có"
                : appointment.getAppointmentTime().format(APPOINTMENT_TIME_FORMAT);
        String reason = (cancellationReason == null || cancellationReason.isBlank())
                ? "Phòng khám cần điều chỉnh lịch tiếp nhận"
                : cancellationReason.trim();

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(recipient);
        message.setSubject("[Phòng khám] Lịch khám của bạn đã bị từ chối");
        message.setText("""
                Xin chào %s,

                Rất tiếc, lịch khám của bạn chưa thể được tiếp nhận.
                - Mã lịch hẹn: %s
                - Thời gian dự kiến: %s
                - Lý do từ chối: %s

                Mong bạn thông cảm và hẹn gặp lại bạn ở lần khám sau.
                Vui lòng đặt lịch mới hoặc liên hệ lễ tân để được hỗ trợ.
                    """.formatted(
                patientName,
                appointment.getId(),
                appointmentTime,
                reason));

        try {
            mailSender.send(message);
            LOGGER.info("Đã gửi email hủy lịch do phòng khám: appointmentId={}, recipient={}", appointment.getId(),
                    recipient);
        } catch (MailException ex) {
            LOGGER.error(
                    "Không thể gửi email hủy lịch do phòng khám: appointmentId={}, recipient={}, error={}",
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
            LOGGER.warn("Bỏ qua gửi email chấp nhận lịch vì spring.mail.username đang trống");
            return;
        }

        String patientName = patient.getFullName() == null || patient.getFullName().isBlank()
                ? "Quý khách"
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
        message.setSubject("[Phòng khám] Lịch khám của bạn đã được chấp nhận");
        message.setText("""
                Xin chào %s,

                Lịch khám của bạn đã được chấp nhận.
                - Mã lịch hẹn: %s
                - Ngày giờ khám: %s
                - Phòng khám: %s
                - Bác sĩ phụ trách: %s

                Vui lòng đến sớm 10-15 phút để làm thủ tục. Hẹn gặp lại bạn tại phòng khám.
                    """.formatted(
                patientName,
                appointment.getId(),
                appointmentTime,
                roomName,
                doctorName));

        try {
            mailSender.send(message);
            LOGGER.info("Đã gửi email chấp nhận lịch khám: appointmentId={}, recipient={}", appointment.getId(),
                    recipient);
        } catch (MailException ex) {
            LOGGER.error(
                    "Không thể gửi email chấp nhận lịch khám: appointmentId={}, recipient={}, error={}",
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
                "Đang chuẩn bị email thông báo lịch hẹn mới cho lễ tân: appointmentId={}, recipientCount={}, configuredRecipients='{}'",
                appointment.getId(),
                recipients.size(),
                receptionistNotificationEmails);
        if (recipients.isEmpty()) {
            LOGGER.warn("Bỏ qua gửi email lịch hẹn mới cho lễ tân vì chưa có người nhận hợp lệ");
            return;
        }

        String from = senderEmail == null ? "" : senderEmail.trim();
        if (from.isBlank()) {
            LOGGER.warn("Bỏ qua gửi email lịch hẹn mới cho lễ tân vì spring.mail.username đang trống");
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
        message.setSubject("[Phòng khám] Có bệnh nhân mới đặt lịch");
        message.setText("""
                Lễ tân có lịch hẹn mới:
                - Mã lịch hẹn: %s
                - Tên bệnh nhân: %s
                - Số điện thoại: %s
                - Thời gian hẹn: %s
                - Triệu chứng: %s
                - Trạng thái: %s
                    """.formatted(
                appointment.getId(),
                patientName,
                patientPhone,
                appointmentTime,
                symptoms,
                appointment.getStatus()));

        try {
            mailSender.send(message);
            LOGGER.info("Đã gửi email lịch hẹn mới cho lễ tân: appointmentId={}, recipients={}", appointment.getId(),
                    recipients);
        } catch (MailException ex) {
            LOGGER.error(
                    "Không thể gửi email lịch hẹn mới cho lễ tân: appointmentId={}, recipients={}, error={}",
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
            throw AppException.of(HttpStatus.BAD_REQUEST, "Email là bắt buộc");
        }

        String from = senderEmail == null ? "" : senderEmail.trim();
        if (from.isBlank()) {
            throw AppException.of(HttpStatus.INTERNAL_SERVER_ERROR, "Chưa cấu hình địa chỉ gửi mail");
        }

        String host = mailHost == null ? "" : mailHost.trim();
        if (host.isBlank()) {
            throw AppException.of(HttpStatus.INTERNAL_SERVER_ERROR, "Chưa cấu hình máy chủ mail");
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
            LOGGER.info("Đã gửi email OTP quên mật khẩu: recipient={}", to);
        } catch (MailException ex) {
            LOGGER.error("Không thể gửi email OTP quên mật khẩu: recipient={}, error={}", to, ex.getMessage(), ex);
            throw AppException.of(HttpStatus.SERVICE_UNAVAILABLE, "Hiện không thể gửi email OTP");
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
