package com.example.demo.service;

import java.security.SecureRandom;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.ForgotPasswordRequest;
import com.example.demo.dto.PatientRegisterRequest;
import com.example.demo.dto.ResetPasswordWithOtpRequest;
import com.example.demo.dto.VerifyForgotPasswordOtpRequest;
import com.example.demo.entity.Patient;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.PatientRepository;
import com.example.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String RESET_OTP_KEY_PREFIX = "auth:forgot-password:otp:";
    private static final String RESET_OTP_VERIFIED_KEY_PREFIX = "auth:forgot-password:verified:";
    private static final String RESET_OTP_COOLDOWN_KEY_PREFIX = "auth:forgot-password:cooldown:";
    private static final String RESET_OTP_SEND_COUNT_KEY_PREFIX = "auth:forgot-password:send-count:";
    private static final String RESET_OTP_INVALID_COUNT_KEY_PREFIX = "auth:forgot-password:invalid-count:";

    @Value("${auth.forgot-password.otp.ttl-minutes:10}")
    private long resetOtpTtlMinutes;

    @Value("${auth.forgot-password.otp.cooldown-seconds:60}")
    private long resetOtpCooldownSeconds;

    @Value("${auth.forgot-password.otp.send-limit-window-minutes:60}")
    private long resetOtpSendLimitWindowMinutes;

    @Value("${auth.forgot-password.otp.max-send-attempts:5}")
    private int resetOtpMaxSendAttempts;

    @Value("${auth.forgot-password.otp.max-invalid-attempts:5}")
    private int resetOtpMaxInvalidAttempts;

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;
    private final StringRedisTemplate redisTemplate;

    private final SecureRandom secureRandom = new SecureRandom();

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

        // Đảm bảo khả năng tương thích ngược với các giá trị văn bản thuần túy cũ trong
        // cột mật khẩu.
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

        if (request.getGmail() != null
                && !request.getGmail().isBlank()
                && patientRepository.existsByGmail(request.getGmail().trim().toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Gmail already exists");
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
        patient.setGmail(normalizeGmail(request.getGmail()));
        patientRepository.save(patient);

        String token = jwtService.generateToken(user.getUsername(), user.getRole().name());
        return buildAuthResponse(token, user);
    }

    // Chức năng: gửi OTP cho luồng quên mật khẩu.
    public void sendForgotPasswordOtp(ForgotPasswordRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        User user = findUserByEmailForReset(normalizedEmail);

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is inactive");
        }

        enforceOtpSendLimitOrThrow(user.getId());

        String otp = generateOtp();
        saveOtpToRedis(user.getId(), otp);
        try {
            notificationService.sendForgotPasswordOtp(normalizedEmail, otp);
            recordSuccessfulOtpSend(user.getId());
        } catch (RuntimeException ex) {
            clearResetOtpSilently(user.getId());
            throw ex;
        }
    }

    // Chức năng: xác thực OTP đã nhập từ email.
    public void verifyForgotPasswordOtp(VerifyForgotPasswordOtpRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        User user = findUserByEmailForReset(normalizedEmail);

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is inactive");
        }

        validateOtpOrThrow(user.getId(), request.getOtp().trim());
        markOtpVerified(user.getId());
    }

    // Chức năng: reset mật khẩu sau khi OTP đã được xác thực.
    public void resetPasswordWithOtp(ResetPasswordWithOtpRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        User user = findUserByEmailForReset(normalizedEmail);

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is inactive");
        }

        ensureOtpVerifiedOrThrow(user.getId());

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword().trim()));
        clearResetOtp(user.getId());
        userRepository.save(user);
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

    // Chức năng: xử lý chuẩn hóa gmail để lưu và kiểm tra trùng không phân biệt hoa
    // thường.
    private String normalizeGmail(String value) {
        String normalized = trimToNull(value);
        return normalized == null ? null : normalized.toLowerCase();
    }

    // Chức năng: chuẩn hóa email để tìm người dùng quên mật khẩu.
    private String normalizeEmail(String email) {
        String normalized = trimToNull(email);
        if (normalized == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        return normalized.toLowerCase();
    }

    // Chức năng: tìm user theo email bệnh nhân hoặc username dạng email.
    private User findUserByEmailForReset(String normalizedEmail) {
        Patient patient = patientRepository.findByGmailIgnoreCase(normalizedEmail)
                .orElse(null);
        if (patient != null && patient.getUser() != null) {
            return patient.getUser();
        }

        return userRepository.findByUsernameIgnoreCase(normalizedEmail)
                .filter(candidate -> isValidEmail(candidate.getUsername()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email not found"));
    }

    // Chức năng: tạo OTP 6 chữ số ngẫu nhiên.
    private String generateOtp() {
        return String.format("%06d", secureRandom.nextInt(1_000_000));
    }

    // Chức năng: lưu OTP vào Redis với TTL cấu hình.
    private void saveOtpToRedis(Long userId, String otp) {
        String otpKey = buildOtpKey(userId);
        String verifiedKey = buildVerifiedKey(userId);
        String invalidCountKey = buildInvalidCountKey(userId);
        try {
            redisTemplate.opsForValue().set(otpKey, otp, otpTtlDuration());
            redisTemplate.delete(verifiedKey);
            redisTemplate.delete(invalidCountKey);
        } catch (DataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Redis is unavailable");
        }
    }

    // Chức năng: kiểm tra cooldown và giới hạn số lần gửi OTP.
    private void enforceOtpSendLimitOrThrow(Long userId) {
        String cooldownKey = buildCooldownKey(userId);
        String sendCountKey = buildSendCountKey(userId);
        try {
            if (Boolean.TRUE.equals(redisTemplate.hasKey(cooldownKey))) {
                throw new ResponseStatusException(
                        HttpStatus.TOO_MANY_REQUESTS,
                        "Please wait " + otpCooldownSeconds() + " seconds before requesting OTP again");
            }

            String rawSendCount = redisTemplate.opsForValue().get(sendCountKey);
            long sendCount = parseLongSafely(rawSendCount);
            if (sendCount >= otpMaxSendAttempts()) {
                throw new ResponseStatusException(
                        HttpStatus.TOO_MANY_REQUESTS,
                        "Too many OTP requests. Please try again later");
            }
        } catch (DataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Redis is unavailable");
        }
    }

    // Chức năng: ghi nhận gửi OTP thành công để áp cooldown và hạn mức gửi.
    private void recordSuccessfulOtpSend(Long userId) {
        String cooldownKey = buildCooldownKey(userId);
        String sendCountKey = buildSendCountKey(userId);
        try {
            redisTemplate.opsForValue().set(cooldownKey, "1", otpCooldownDuration());

            Long sendCount = redisTemplate.opsForValue().increment(sendCountKey);
            if (sendCount != null && sendCount == 1L) {
                redisTemplate.expire(sendCountKey, otpSendLimitWindowDuration());
            }
        } catch (DataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Redis is unavailable");
        }
    }

    // Chức năng: xác thực OTP và trạng thái hết hạn.
    private void validateOtpOrThrow(Long userId, String otp) {
        String otpKey = buildOtpKey(userId);
        String expectedOtp;

        try {
            expectedOtp = redisTemplate.opsForValue().get(otpKey);
        } catch (DataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Redis is unavailable");
        }

        if (expectedOtp == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP has not been requested");
        }

        if (!expectedOtp.equals(otp)) {
            registerInvalidOtpAttemptOrThrow(userId, otpKey);
        }
    }

    // Chức năng: theo dõi số lần nhập OTP sai và khóa khi vượt ngưỡng.
    private void registerInvalidOtpAttemptOrThrow(Long userId, String otpKey) {
        String invalidCountKey = buildInvalidCountKey(userId);
        try {
            Long invalidCount = redisTemplate.opsForValue().increment(invalidCountKey);
            if (invalidCount != null && invalidCount == 1L) {
                Long remainingSeconds = redisTemplate.getExpire(otpKey);
                if (remainingSeconds != null && remainingSeconds > 0) {
                    redisTemplate.expire(invalidCountKey, Duration.ofSeconds(remainingSeconds));
                } else {
                    redisTemplate.expire(invalidCountKey, otpTtlDuration());
                }
            }

            if (invalidCount != null && invalidCount >= otpMaxInvalidAttempts()) {
                clearResetOtp(userId);
                throw new ResponseStatusException(
                        HttpStatus.TOO_MANY_REQUESTS,
                        "Too many invalid OTP attempts. Please request a new OTP");
            }
        } catch (DataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Redis is unavailable");
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OTP");
    }

    // Chức năng: đánh dấu OTP đã verify trong Redis với cùng TTL còn lại.
    private void markOtpVerified(Long userId) {
        String otpKey = buildOtpKey(userId);
        String verifiedKey = buildVerifiedKey(userId);
        String invalidCountKey = buildInvalidCountKey(userId);

        Long remainingSeconds;
        try {
            remainingSeconds = redisTemplate.getExpire(otpKey);
        } catch (DataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Redis is unavailable");
        }

        if (remainingSeconds == null || remainingSeconds <= 0) {
            clearResetOtp(userId);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP has expired");
        }

        try {
            redisTemplate.opsForValue().set(verifiedKey, "1", Duration.ofSeconds(remainingSeconds));
            redisTemplate.delete(invalidCountKey);
        } catch (DataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Redis is unavailable");
        }
    }

    // Chức năng: chỉ cho phép reset khi OTP đã xác thực và còn hiệu lực.
    private void ensureOtpVerifiedOrThrow(Long userId) {
        String verifiedKey = buildVerifiedKey(userId);
        Boolean exists;
        try {
            exists = redisTemplate.hasKey(verifiedKey);
        } catch (DataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Redis is unavailable");
        }

        if (!Boolean.TRUE.equals(exists)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP has not been verified");
        }
    }

    // Chức năng: xóa trạng thái OTP trên Redis sau khi dùng hoặc hết hạn.
    private void clearResetOtp(Long userId) {
        try {
            redisTemplate.delete(buildOtpKey(userId));
            redisTemplate.delete(buildVerifiedKey(userId));
            redisTemplate.delete(buildInvalidCountKey(userId));
        } catch (DataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Redis is unavailable");
        }
    }

    private void clearResetOtpSilently(Long userId) {
        try {
            clearResetOtp(userId);
        } catch (ResponseStatusException ignored) {
            // Keep original exception from email/flow operation.
        }
    }

    private String buildOtpKey(Long userId) {
        return RESET_OTP_KEY_PREFIX + userId;
    }

    private String buildVerifiedKey(Long userId) {
        return RESET_OTP_VERIFIED_KEY_PREFIX + userId;
    }

    private String buildCooldownKey(Long userId) {
        return RESET_OTP_COOLDOWN_KEY_PREFIX + userId;
    }

    private String buildSendCountKey(Long userId) {
        return RESET_OTP_SEND_COUNT_KEY_PREFIX + userId;
    }

    private String buildInvalidCountKey(Long userId) {
        return RESET_OTP_INVALID_COUNT_KEY_PREFIX + userId;
    }

    private long parseLongSafely(String rawValue) {
        if (rawValue == null || rawValue.isBlank()) {
            return 0L;
        }
        try {
            return Long.parseLong(rawValue);
        } catch (NumberFormatException ignored) {
            return 0L;
        }
    }

    private Duration otpTtlDuration() {
        return Duration.ofMinutes(Math.max(1L, resetOtpTtlMinutes));
    }

    private Duration otpCooldownDuration() {
        return Duration.ofSeconds(otpCooldownSeconds());
    }

    private long otpCooldownSeconds() {
        return Math.max(1L, resetOtpCooldownSeconds);
    }

    private Duration otpSendLimitWindowDuration() {
        return Duration.ofMinutes(Math.max(1L, resetOtpSendLimitWindowMinutes));
    }

    private int otpMaxSendAttempts() {
        return Math.max(1, resetOtpMaxSendAttempts);
    }

    private int otpMaxInvalidAttempts() {
        return Math.max(1, resetOtpMaxInvalidAttempts);
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

}
