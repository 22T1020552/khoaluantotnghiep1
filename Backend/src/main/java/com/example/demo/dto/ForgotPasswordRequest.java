package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ForgotPasswordRequest {

    @NotBlank(message = "email is required")
    @Email(message = "email is invalid")
    @Size(max = 100, message = "email must be <= 100 characters")
    private String email;
}