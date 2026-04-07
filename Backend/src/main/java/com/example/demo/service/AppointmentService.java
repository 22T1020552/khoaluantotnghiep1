package com.example.demo.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.AppointmentRequest;
import com.example.demo.dto.PatientAppointmentRequest;
import com.example.demo.dto.PatientPrefillResponse;
import com.example.demo.entity.Appointment;
import com.example.demo.entity.Patient;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.repository.PatientRepository;
import com.example.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private static final String STATUS_PENDING_CONFIRMATION = "PENDING";
    private static final String STATUS_IN_PROGRESS = "IN_PROGRESS";
    private static final String STATUS_COMPLETED = "COMPLETED";
    private static final String STATUS_CANCELLED = "CANCELLED";
    private static final String STATUS_CANCELLED_BY_CLINIC = "CANCELLED_BY_CLINIC";
    private static final Set<String> RELEASED_SLOT_STATUSES = Set.of(
            STATUS_CANCELLED,
            STATUS_CANCELLED_BY_CLINIC);

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final PatientService patientService;
    private final NotificationService notificationService;

    // Chức năng: xử lý lấy danh sách tất cả lịch hẹn.
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    // Chức năng: xử lý lấy danh sách lịch hẹn đang chờ phân công.
    public List<Appointment> getWaitingAssignmentAppointments() {
        return appointmentRepository.findByStatusInOrderByAppointmentTimeAsc(
                List.of(STATUS_PENDING_CONFIRMATION, "DRAFT", "PENDING", "PENDING_CONFIRMATION"));
    }

    // Chức năng: xử lý lấy thông tin trước cho bệnh nhân.
    public PatientPrefillResponse getPatientPrefill(Long patientId) {
        Patient patient = resolvePatient(patientId);

        PatientPrefillResponse response = new PatientPrefillResponse();
        response.setPatientId(patient.getId());
        response.setFullName(patient.getFullName());
        response.setNationalId(patient.getNationalId());
        response.setPhoneNumber(patient.getPhoneNumber());
        response.setHealthInsuranceNumber(patient.getHealthInsuranceNumber());
        response.setGmail(patient.getGmail());
        return response;
    }

    // Chức năng: xử lý tạo lịch hẹn cho bệnh nhân.
    public Appointment createAppointmentForPatient(PatientAppointmentRequest request) {
        Patient patient = resolvePatient(request.getPatientId());
        LocalDateTime appointmentTime = resolvePatientAppointmentTime(request);
        String symptoms = resolveSymptoms(request);

        ensureNoConflictWithScheduledPatient(patient.getId(), appointmentTime);

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setAppointmentTime(appointmentTime);
        appointment.setStatus(STATUS_PENDING_CONFIRMATION);
        appointment.setSymptoms(symptoms);

        Appointment savedAppointment = appointmentRepository.save(appointment);
        notificationService.notifyReceptionistNewPatientBooking(savedAppointment);
        return savedAppointment;
    }

    // Chức năng: xử lý tạo lịch hẹn.
    public Appointment createAppointment(AppointmentRequest request) {
        validateTimeSlotRange(request.getTimeSlot());

        if (request.getPatientId() == null || request.getDoctorId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "patientId và doctorId là bắt buộc");
        }

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bệnh nhân"));

        User doctor = userRepository.findByIdAndRole(request.getDoctorId(), Role.DOCTOR)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bác sĩ"));

        LocalDateTime appointmentTime = combineDateAndStartTime(request.getAppointmentDate(), request.getTimeSlot());

        boolean exists = appointmentRepository.countDoctorScheduleConflicts(
            doctor.getId(),
            appointmentTime,
            null) > 0;
        if (exists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bác sĩ đã có lịch hẹn vào thời điểm này");
        }

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentTime(appointmentTime);
        appointment.setStatus(STATUS_PENDING_CONFIRMATION);

        Appointment savedAppointment = appointmentRepository.save(appointment);
        notificationService.notifyReceptionistNewPatientBooking(savedAppointment);
        return savedAppointment;
    }

    // Chức năng: xử lý chỉ định bác sĩ đến cuộc hẹn.
    public Appointment assignDoctorToAppointment(Long appointmentId, Long doctorId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch hẹn"));

        User doctor = userRepository.findByIdAndRole(doctorId, Role.DOCTOR)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bác sĩ"));

        ensureDoctorIsAvailable(doctor.getId(), appointment.getAppointmentTime(), appointment.getId());

        appointment.setDoctor(doctor);
        appointment.setStatus(STATUS_PENDING_CONFIRMATION);

        return appointmentRepository.save(appointment);
    }

    // Chức năng: xử lý đảm bảo có bác sĩ.
    private void ensureDoctorIsAvailable(Long doctorId, LocalDateTime appointmentTime, Long appointmentId) {
        boolean exists = appointmentRepository.countDoctorScheduleConflicts(
                doctorId,
                appointmentTime,
                appointmentId) > 0;
        if (exists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bác sĩ đã có lịch hẹn vào thời điểm này");
        }
    }

    // Chức năng: xử lý giải quyết thời gian hẹn bệnh nhân.
    private LocalDateTime resolvePatientAppointmentTime(PatientAppointmentRequest request) {
        if (request.getAppointmentTime() != null) {
            return request.getAppointmentTime();
        }

        if (request.getAppointmentDate() != null && request.getTimeSlot() != null && !request.getTimeSlot().isBlank()) {
            validateTimeSlotRange(request.getTimeSlot());
            return combineDateAndStartTime(request.getAppointmentDate(), request.getTimeSlot());
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "appointmentTime là bắt buộc");
    }

    // Chức năng: xử lý giải quyết các triệu chứng.
    private String resolveSymptoms(PatientAppointmentRequest request) {
        if (request.getSymptoms() != null && !request.getSymptoms().isBlank()) {
            return request.getSymptoms().trim();
        }

        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            return request.getNotes().trim();
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Triệu chứng là bắt buộc");
    }

    // Chức năng: xử lý chặn trùng giờ với lịch của bệnh nhân khác đã được xếp bác sĩ.
    private void ensureNoConflictWithScheduledPatient(Long patientId, LocalDateTime appointmentTime) {
        boolean occupied = appointmentRepository.existsByPatient_IdNotAndAppointmentTimeAndDoctorIsNotNullAndStatusNotIn(
                patientId,
                appointmentTime,
                RELEASED_SLOT_STATUSES);

        if (occupied) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Khung giờ này đã có bệnh nhân được xếp lịch. Vui lòng chọn giờ khác");
        }
    }

    // Chức năng: xử lý kết hợp ngày và giờ bắt đầu.
    private LocalDateTime combineDateAndStartTime(LocalDate appointmentDate, String timeSlot) {
        String[] parts = timeSlot.split("-");
        LocalTime start = LocalTime.parse(parts[0]);
        return appointmentDate.atTime(start);
    }

    // Chức năng: xử lý validate thứ tự .
    private void validateTimeSlotRange(String timeSlot) {
        String[] parts = timeSlot.split("-");
        if (parts.length != 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Định dạng timeSlot không hợp lệ");
        }

        try {
            LocalTime start = LocalTime.parse(parts[0]);
            LocalTime end = LocalTime.parse(parts[1]);
            if (!end.isAfter(start)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thời gian kết thúc của timeSlot phải sau thời gian bắt đầu");
            }
        } catch (DateTimeParseException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giá trị timeSlot không hợp lệ");
        }
    }

    // Chức năng: xử lý giải quyết bệnh nhân.
    private Patient resolvePatient(Long patientId) {
        if (patientId != null) {
            return patientRepository.findById(patientId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bệnh nhân"));
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null
                || "anonymousUser".equals(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "patientId là bắt buộc khi người dùng chưa xác thực");
        }

        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));

        if (user.getPatient() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Authenticated user is not linked to a patient profile");
        }

        return user.getPatient();
    }

    // Chức năng: xử lý lấy danh sách cuộc hẹn của bệnh nhân.
    public List<Appointment> getMyAppointments(String username) {
        Patient patient = patientService.getPatientFromUsername(username);
        return appointmentRepository.findByPatient_IdAndStatusNotInOrderByAppointmentTimeDesc(
                patient.getId(),
                List.of(STATUS_CANCELLED, STATUS_CANCELLED_BY_CLINIC));
    }

    // Chức năng: xử lý bệnh nhân hủy cuộc hẹn.
    public Appointment cancelMyAppointment(Long appointmentId, String username) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch hẹn"));

        Patient patient = patientService.getPatientFromUsername(username);
        if (appointment.getPatient() == null || !appointment.getPatient().getId().equals(patient.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn chỉ có thể hủy lịch hẹn của chính mình");
        }

        String normalizedStatus = normalizeStatus(appointment.getStatus());
        if (STATUS_CANCELLED.equals(normalizedStatus) || STATUS_CANCELLED_BY_CLINIC.equals(normalizedStatus)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Lịch hẹn đã được hủy");
        }

        if (STATUS_IN_PROGRESS.equals(normalizedStatus)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Không thể hủy vì lịch đang được thực hiện");
        }

        if (STATUS_COMPLETED.equals(normalizedStatus)
                || (appointment.getAppointmentTime() != null
                        && !appointment.getAppointmentTime().isAfter(LocalDateTime.now()))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Không thể hủy vì đã quá giờ hẹn");
        }

        appointment.setStatus(STATUS_CANCELLED);
        appointment.setDoctor(null);
        return appointmentRepository.save(appointment);
    }

    // Chức năng: xử lý chuẩn hóa trạng thái.
    private String normalizeStatus(String status) {
        if (status == null) {
            return "";
        }
        return status.trim().toUpperCase();
    }
}
