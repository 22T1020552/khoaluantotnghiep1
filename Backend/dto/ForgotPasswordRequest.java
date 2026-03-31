package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ForgotPasswordRequest {

    @NotBlank(message = "username is required")
    private String username;

    @Size(max = 20, message = "nationalId must be <= 20 characters")
    private String nationalId;

    @Size(max = 15, message = "phoneNumber must be <= 15 characters")
    private String phoneNumber;

    @NotBlank(message = "newPassword is required")
    @Size(min = 6, max = 100, message = "newPassword must be between 6 and 100 characters")
    private String newPassword;
}
