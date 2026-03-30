package com.example.demo.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.PatientRegisterRequest;
import com.example.demo.entity.Patient;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.PatientRepository;
import com.example.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    // Chức năng: xử lý login.
    public AuthResponse login(String username, String password) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Wrong username or password"));

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is inactive");
        }

        String stored = user.getPasswordHash();
        boolean valid = false;
        if (stored != null) {
            try {
                valid = passwordEncoder.matches(password, stored);
            } catch (IllegalArgumentException ignored) {
                // Các giá trị văn bản thuần túy cũ được xử lý bằng phương án dự phòng bên dưới.
            }
        }

        // Đảm bảo khả năng tương thích ngược với các giá trị văn bản thuần túy cũ trong cột mật khẩu.
        if (!valid && stored != null && stored.equals(password)) {
            user.setPasswordHash(passwordEncoder.encode(password));
            userRepository.save(user);
            valid = true;
        }

        if (!valid) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Wrong username or password");
        }

        String token = jwtService.generateToken(user.getUsername(), user.getRole().name());
        return buildAuthResponse(token, user);
    }

    // Chức năng: xử lý register patient.
    public AuthResponse registerPatient(PatientRegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }

        if (request.getNationalId() != null
                && !request.getNationalId().isBlank()
                && patientRepository.existsByNationalId(request.getNationalId().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "National ID already exists");
        }

        if (request.getPhoneNumber() != null
                && !request.getPhoneNumber().isBlank()
                && patientRepository.existsByPhoneNumber(request.getPhoneNumber().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone number already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.PATIENT);
        user.setIsActive(true);
        user = userRepository.save(user);

        Patient patient = new Patient();
        patient.setUser(user);
        patient.setFullName(request.getFullName().trim());
        patient.setGender(trimToNull(request.getGender()));
        patient.setNationalId(trimToNull(request.getNationalId()));
        patient.setHealthInsuranceNumber(trimToNull(request.getHealthInsuranceNumber()));
        patient.setPhoneNumber(trimToNull(request.getPhoneNumber()));
        patientRepository.save(patient);

        String token = jwtService.generateToken(user.getUsername(), user.getRole().name());
        return buildAuthResponse(token, user);
    }

    // Chức năng: xử lý tạo phản hồi xác thực.
    private AuthResponse buildAuthResponse(String token, User user) {
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUsername(user.getUsername());
        response.setRole(user.getRole());
        return response;
    }

    // Chức năng: xử lý trim to null.
    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}

