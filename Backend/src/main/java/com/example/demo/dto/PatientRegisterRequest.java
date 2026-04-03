package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PatientRegisterRequest {

    @NotBlank(message = "username is required")
    @Pattern(regexp = "^[a-zA-Z0-9._-]{4,50}$", message = "username must be 4-50 chars and contain no spaces")
    private String username;

    @NotBlank(message = "password is required")
    @Size(min = 6, max = 100, message = "password must be between 6 and 100 characters")
    private String password;

    @NotBlank(message = "fullName is required")
    @Size(max = 100, message = "fullName must be <= 100 characters")
    private String fullName;

    @Size(max = 10, message = "gender must be <= 10 characters")
    private String gender;

    @Size(max = 20, message = "nationalId must be <= 20 characters")
    private String nationalId;

    @Size(max = 20, message = "healthInsuranceNumber must be <= 20 characters")
    private String healthInsuranceNumber;

    @Size(max = 15, message = "phoneNumber must be <= 15 characters")
    private String phoneNumber;

    @Email(message = "gmail must be a valid email")
    @Size(max = 100, message = "gmail must be <= 100 characters")
    private String gmail;
}
