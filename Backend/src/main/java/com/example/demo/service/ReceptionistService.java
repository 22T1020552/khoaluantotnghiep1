package com.example.demo.service;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import com.example.demo.exception.AppException;

import com.example.demo.dto.ReceptionistDoctorOptionResponse;
import com.example.demo.entity.Appointment;
import com.example.demo.entity.Role;
import com.example.demo.entity.Room;
import com.example.demo.entity.User;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.repository.RoomRepository;
import com.example.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReceptionistService {

    public static final String STATUS_PENDING_CONFIRMATION = "PENDING";
    public static final String STATUS_WAITING = "WAITING";
    public static final String STATUS_IN_PROGRESS = "IN_PROGRESS";
    public static final String STATUS_COMPLETED = "COMPLETED";
    public static final String STATUS_CANCELLED = "CANCELLED";
    public static final String STATUS_CANCELLED_BY_CLINIC = "CANCELLED_BY_CLINIC";

    private static final Set<String> RECEPTIONIST_CANCELLABLE_STATUSES = Set.of(
            STATUS_PENDING_CONFIRMATION,
            STATUS_WAITING);
    private static final Set<String> RELEASED_SLOT_STATUSES = Set.of(
            STATUS_CANCELLED,
            STATUS_CANCELLED_BY_CLINIC);

    private static final Set<String> WAITING_STATUSES = Set.of(
            STATUS_PENDING_CONFIRMATION,
            STATUS_WAITING,
            STATUS_IN_PROGRESS,
            STATUS_COMPLETED);

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final NotificationService notificationService;

    // Chức năng: xử lý lấy danh sách cuộc hẹn hôm nay.
    public List<Appointment> getTodayAppointments() {
        LocalDateTime from = LocalDate.now().atStartOfDay();
        LocalDateTime to = from.plusDays(1);
        return appointmentRepository.findByAppointmentTimeBetweenOrderByAppointmentTimeAsc(from, to);
    }

    // Chức năng: xử lý lấy danh sách cuộc hẹn từ danh sách đặt lịch.
    public List<Appointment> getAppointmentsFromBookingList() {
        return appointmentRepository.findByStatusInOrderByAppointmentTimeAsc(
                List.of(STATUS_PENDING_CONFIRMATION, "DRAFT", "PENDING", "PENDING_CONFIRMATION"));
    }

    // Chức năng: xử lý lấy danh sách bác sĩ theo chuyên khoa.
    public List<ReceptionistDoctorOptionResponse> getDoctorsBySpecialty(String specialty) {
        String normalizedSpecialty = normalizeOptionalText(specialty);

        Map<Long, ReceptionistDoctorOptionResponse> result = new LinkedHashMap<>();
        List<Room> rooms = roomRepository.findAllByOrderByRoomNameAsc();
        for (Room room : rooms) {
            User doctor = room.getCurrentDoctor();
            if (doctor == null || doctor.getRole() != Role.DOCTOR) {
                continue;
            }

            String roomName = room.getRoomName();
            if (normalizedSpecialty != null && !containsIgnoreCase(roomName, normalizedSpecialty)) {
                continue;
            }

            result.putIfAbsent(
                    doctor.getId(),
                    new ReceptionistDoctorOptionResponse(
                            doctor.getId(),
                            doctor.getUsername(),
                            roomName,
                            roomName));
        }

        if (normalizedSpecialty == null) {
            userRepository.findByRole(Role.DOCTOR).forEach(doctor -> result.putIfAbsent(
                    doctor.getId(),
                    new ReceptionistDoctorOptionResponse(doctor.getId(), doctor.getUsername(), null, null)));
        }

        return result.values().stream().toList();
    }

    // Chức năng: xử lý lấy hàng đợi chờ.
    public List<Appointment> getWaitingQueue(String status) {
        if (status == null || status.isBlank()) {
            return appointmentRepository.findByStatusInOrderByAppointmentTimeAsc(
                    List.of(STATUS_PENDING_CONFIRMATION, STATUS_WAITING, STATUS_IN_PROGRESS));
        }

        String normalizedStatus = normalizeStatus(status);
        if (!WAITING_STATUSES.contains(normalizedStatus)) {
            throw AppException.of(
                    HttpStatus.BAD_REQUEST,
                    "Trạng thái không hợp lệ. Cho phép: PENDING, WAITING, IN_PROGRESS, COMPLETED");
        }

        return appointmentRepository.findByStatusOrderByAppointmentTimeAsc(normalizedStatus);
    }

    // Chức năng: xử lý duyệt cuộc hẹn.
    public Appointment approveAppointment(Long appointmentId, Long doctorId, String specialty) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> AppException.of(HttpStatus.NOT_FOUND, "Không tìm thấy lịch hẹn"));

        String currentStatus = normalizeStatus(appointment.getStatus());
        if (!STATUS_PENDING_CONFIRMATION.equals(currentStatus)) {
            throw AppException.of(HttpStatus.CONFLICT, "Chỉ lịch hẹn ở trạng thái PENDING mới có thể được duyệt");
        }

        User doctor = resolveDoctorForAssignment(doctorId, specialty, appointment.getAppointmentTime(),
                appointment.getId());

        ensureDoctorIsAvailable(doctor.getId(), appointment.getAppointmentTime(), appointment.getId());

        appointment.setDoctor(doctor);
        appointment.setStatus(STATUS_WAITING);

        Appointment saved = appointmentRepository.save(appointment);
        notificationService.notifyAppointmentApproved(saved);
        return saved;
    }

    // Chức năng: xử lý chỉ định bác sĩ và chuyển đến phòng chờ.
    public Appointment assignDoctorAndMoveToWaiting(Long appointmentId, Long doctorId, String specialty) {
        return approveAppointment(appointmentId, doctorId, specialty);
    }

    // Chức năng: xử lý cập nhật trạng thái chờ.
    public Appointment updateWaitingStatus(Long appointmentId, String status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> AppException.of(HttpStatus.NOT_FOUND, "Không tìm thấy lịch hẹn"));

        String normalizedStatus = normalizeStatus(status);
        if (!WAITING_STATUSES.contains(normalizedStatus)) {
            throw AppException.of(
                    HttpStatus.BAD_REQUEST,
                    "Trạng thái không hợp lệ. Cho phép: PENDING, WAITING, IN_PROGRESS, COMPLETED");
        }

        validateTransition(appointment.getStatus(), normalizedStatus);

        if ((STATUS_WAITING.equals(normalizedStatus) || STATUS_IN_PROGRESS.equals(normalizedStatus))
                && appointment.getDoctor() == null) {
            throw AppException.of(HttpStatus.CONFLICT, "Lịch hẹn phải được phân công bác sĩ trước");
        }

        appointment.setStatus(normalizedStatus);
        return appointmentRepository.save(appointment);
    }

    // Chức năng: xử lý từ chối cuộc hẹn.
    public Appointment cancelAppointmentByReceptionist(Long appointmentId, String cancellationReason,
            Boolean requireReason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> AppException.of(HttpStatus.NOT_FOUND, "Không tìm thấy lịch hẹn"));

        String normalizedStatus = normalizeStatus(appointment.getStatus());
        if (!RECEPTIONIST_CANCELLABLE_STATUSES.contains(normalizedStatus)) {
            throw AppException.of(
                    HttpStatus.CONFLICT,
                    "Chỉ lịch hẹn ở trạng thái PENDING hoặc WAITING mới có thể bị lễ tân hủy");
        }

        boolean isReasonRequired = requireReason == null || requireReason;
        String normalizedReason = cancellationReason == null ? null : cancellationReason.trim();
        if (isReasonRequired && (normalizedReason == null || normalizedReason.isBlank())) {
            throw AppException.of(HttpStatus.BAD_REQUEST, "Lý do hủy là bắt buộc");
        }

        appointment.setStatus(STATUS_CANCELLED_BY_CLINIC);
        appointment.setDoctor(null);
        Appointment saved = appointmentRepository.save(appointment);

        notificationService.notifyClinicCancelledAppointment(saved, normalizedReason);
        return saved;
    }

    // Chức năng: xử lý đảm bảo bác sĩ có sẵn.
    private void ensureDoctorIsAvailable(Long doctorId, LocalDateTime appointmentTime, Long appointmentId) {
        boolean occupied = appointmentRepository.existsByDoctor_IdAndAppointmentTimeAndIdNotAndStatusNotIn(
                doctorId,
                appointmentTime,
                appointmentId,
                RELEASED_SLOT_STATUSES);
        if (occupied) {
            throw AppException.of(HttpStatus.CONFLICT, "Bác sĩ đã có lịch hẹn vào thời điểm này");
        }
    }

    // Chức năng: xử lý chọn bác sĩ từ doctorId hoặc chuyên khoa.
    private User resolveDoctorForAssignment(Long doctorId, String specialty, LocalDateTime appointmentTime,
            Long appointmentId) {
        if (doctorId != null) {
            return userRepository.findByIdAndRole(doctorId, Role.DOCTOR)
                    .orElseThrow(() -> AppException.of(HttpStatus.NOT_FOUND, "Không tìm thấy bác sĩ"));
        }

        String normalizedSpecialty = normalizeOptionalText(specialty);
        if (normalizedSpecialty == null) {
            throw AppException.of(HttpStatus.BAD_REQUEST, "doctorId hoặc specialty là bắt buộc");
        }

        return getDoctorsBySpecialty(normalizedSpecialty).stream()
                .map(option -> userRepository.findByIdAndRole(option.getDoctorId(), Role.DOCTOR).orElse(null))
                .filter(doctor -> doctor != null)
                .filter(doctor -> isDoctorAvailable(doctor.getId(), appointmentTime, appointmentId))
                .findFirst()
                .orElseThrow(() -> AppException.of(
                        HttpStatus.NOT_FOUND,
                        "No available doctor found for specialty: " + normalizedSpecialty));
    }

    // Chức năng: xử lý kiểm tra bác sĩ có rảnh ở khung giờ không.
    private boolean isDoctorAvailable(Long doctorId, LocalDateTime appointmentTime, Long appointmentId) {
        return !appointmentRepository.existsByDoctor_IdAndAppointmentTimeAndIdNotAndStatusNotIn(
                doctorId,
                appointmentTime,
                appointmentId,
                RELEASED_SLOT_STATUSES);
    }

    // Chức năng: xử lý xác thực quá trình chuyển đổi trạng thái.
    private void validateTransition(String currentStatus, String nextStatus) {
        String normalizedCurrent = normalizeStatus(currentStatus);
        if (normalizedCurrent.equals(nextStatus)) {
            return;
        }

        boolean valid = switch (normalizedCurrent) {
            case STATUS_PENDING_CONFIRMATION -> STATUS_WAITING.equals(nextStatus);
            case STATUS_WAITING -> STATUS_IN_PROGRESS.equals(nextStatus);
            case STATUS_IN_PROGRESS -> STATUS_COMPLETED.equals(nextStatus);
            case STATUS_COMPLETED -> false;
            default -> false;
        };

        if (!valid) {
            throw AppException.of(
                    HttpStatus.CONFLICT,
                    "Chuyển trạng thái không hợp lệ: " + normalizedCurrent + " -> " + nextStatus);
        }
    }

    // Chức năng: xử lý chuẩn hóa trạng thái.
    private String normalizeStatus(String status) {
        if (status == null) {
            throw AppException.of(HttpStatus.BAD_REQUEST, "Trạng thái là bắt buộc");
        }

        String value = normalizeComparableStatus(status);
        return switch (value) {
            case "CHO_XAC_NHAN", "PENDING", "PENDING_CONFIRMATION", "DRAFT" -> STATUS_PENDING_CONFIRMATION;
            case "DANG_CHO", "WAITING" -> STATUS_WAITING;
            case "DANG_KHAM", "IN_PROGRESS" -> STATUS_IN_PROGRESS;
            case "DA_KHAM", "COMPLETED" -> STATUS_COMPLETED;
            default -> value;
        };
    }

    // Chức năng: xử lý chuẩn hóa trạng thái có thể so sánh.
    private String normalizeComparableStatus(String status) {
        String compact = status.trim().replace('-', '_').replace(' ', '_').toUpperCase();
        String withoutAccents = Normalizer.normalize(compact, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "");
        return withoutAccents;
    }

    // Chức năng: xử lý chuẩn hóa text tùy chọn.
    private String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        return trimmed;
    }

    // Chức năng: xử lý so khớp chuỗi không phân biệt hoa thường.
    private boolean containsIgnoreCase(String left, String right) {
        if (left == null || right == null) {
            return false;
        }
        return left.toLowerCase(Locale.ROOT).contains(right.toLowerCase(Locale.ROOT));
    }
}

