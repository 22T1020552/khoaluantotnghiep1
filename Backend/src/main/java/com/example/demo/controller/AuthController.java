package com.example.demo.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.ForgotPasswordRequest;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.PatientRegisterRequest;
import com.example.demo.dto.ResetPasswordWithOtpRequest;
import com.example.demo.dto.VerifyForgotPasswordOtpRequest;
import com.example.demo.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Dang nhap va dang ky tai khoan benh nhan. Nhom nay khong yeu cau JWT.")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Dang nhap", description = "Dang nhap bang username/password va nhan access token JWT.")
    // Chức năng: xử lý đăng nhập.
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request.getUsername(), request.getPassword());
    }

    // Chức năng: xử lý bệnh nhân đăng ký.
    @PostMapping("/register/patient")
    @Operation(summary = "Dang ky benh nhan", description = "Tao tai khoan benh nhan moi va tra ve token dang nhap.")
    public AuthResponse registerPatient(@Valid @RequestBody PatientRegisterRequest request) {
        return authService.registerPatient(request);
    }

    @PostMapping("/forgot-password/send-otp")
    @Operation(summary = "Gui OTP quen mat khau", description = "Nhan email, tao OTP va gui OTP qua email cho nguoi dung.")
    public String sendForgotPasswordOtp(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.sendForgotPasswordOtp(request);
        return "OTP sent successfully";
    }

    @PostMapping("/forgot-password/verify-otp")
    @Operation(summary = "Xac thuc OTP quen mat khau", description = "Xac thuc ma OTP tu email de cho phep reset mat khau.")
    public String verifyForgotPasswordOtp(@Valid @RequestBody VerifyForgotPasswordOtpRequest request) {
        authService.verifyForgotPasswordOtp(request);
        return "OTP verified successfully";
    }

    @PostMapping("/forgot-password/reset")
    @Operation(summary = "Reset mat khau sau OTP", description = "Cap nhat mat khau moi sau khi OTP da duoc xac thuc hop le.")
    public String resetPasswordWithOtp(@Valid @RequestBody ResetPasswordWithOtpRequest request) {
        authService.resetPasswordWithOtp(request);
        return "Password updated successfully";
    }
}
