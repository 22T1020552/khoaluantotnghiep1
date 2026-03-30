package com.example.demo.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.PatientRegisterRequest;
import com.example.demo.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(
    name = "Auth",
    description = "Dang nhap va dang ky tai khoan benh nhan. Nhom nay khong yeu cau JWT."
)
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Dang nhap", description = "Dang nhap bang username/password va nhan access token JWT.")
    // Chức năng: xử lý login.
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request.getUsername(), request.getPassword());
    }

    @PostMapping("/login-legacy")
    @Operation(summary = "Dang nhap legacy", description = "Dang nhap bang query params username/password de tuong thich client cu.")
    // Chức năng: xử lý login legacy.
    public AuthResponse loginLegacy(@RequestParam String username,
                        @RequestParam String password) {

        return authService.login(username, password);

    }

    // Chức năng: xử lý register patient.
    @PostMapping("/register/patient")
    @Operation(summary = "Dang ky benh nhan", description = "Tao tai khoan benh nhan moi va tra ve token dang nhap.")
    public AuthResponse registerPatient(@Valid @RequestBody PatientRegisterRequest request) {
        return authService.registerPatient(request);
    }
}

