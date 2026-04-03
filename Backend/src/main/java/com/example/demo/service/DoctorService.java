package com.example.demo.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.DoctorResponse;
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
public class DoctorService {

    private static final String STATUS_WAITING = "WAITING";

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final RoomRepository roomRepository;

    // Chức năng: lấy danh sách tất cả bác sĩ.
    public List<DoctorResponse> getAllDoctors() {
        return userRepository.findByRole(Role.DOCTOR).stream()
                .map(this::toDoctorResponse)
                .toList();
    }

    // Chức năng: cập nhật phòng khám cho bác sĩ.
    public DoctorResponse updateClinicRoom(Long doctorId, String clinicRoom) {
        if (clinicRoom == null || clinicRoom.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "clinicRoom is required");
        }

        User doctor = userRepository.findByIdAndRole(doctorId, Role.DOCTOR)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found"));

        String normalizedRoomName = clinicRoom.trim();

        Room targetRoom = roomRepository.findByRoomName(normalizedRoomName).orElseGet(Room::new);
        targetRoom.setRoomName(normalizedRoomName);
        targetRoom.setCurrentDoctor(doctor);
        targetRoom = roomRepository.save(targetRoom);

        List<Room> previouslyAssignedRooms = roomRepository.findByCurrentDoctor_Id(doctorId);
        for (Room room : previouslyAssignedRooms) {
            if (!Objects.equals(room.getId(), targetRoom.getId())) {
                room.setCurrentDoctor(null);
            }
        }
        roomRepository.saveAll(previouslyAssignedRooms);

        return toDoctorResponse(doctor);
    }

    // Chức năng: lấy danh sách bệnh nhân đang chờ khám.
    public List<Appointment> getMyWaitingPatients(String username, LocalDate date) {
        User doctor = userRepository.findByUsernameAndRole(username, Role.DOCTOR)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor account not found"));

        if (date != null) {
            LocalDateTime from = date.atStartOfDay();
            LocalDateTime to = from.plusDays(1);
            return appointmentRepository.findByDoctor_IdAndStatusAndAppointmentTimeBetweenOrderByAppointmentTimeAsc(
                    doctor.getId(),
                    STATUS_WAITING,
                    from,
                    to
            );
        }

        return appointmentRepository.findByDoctor_IdAndStatusOrderByAppointmentTimeAsc(
                doctor.getId(),
                STATUS_WAITING
        );
    }

    // Chức năng: lời khuyên của bác sĩ.
    private DoctorResponse toDoctorResponse(User doctor) {
        return new DoctorResponse(doctor.getId(), doctor.getUsername(), doctor.getIsActive());
    }
}

