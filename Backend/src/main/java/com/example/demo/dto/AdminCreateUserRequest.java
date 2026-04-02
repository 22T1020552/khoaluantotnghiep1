package com.example.demo.dto;

import com.example.demo.entity.Role;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminCreateUserRequest {

    @NotBlank(message = "username is required")
    @Pattern(regexp = "^[a-zA-Z0-9._-]{4,50}$", message = "username must be 4-50 chars and contain no spaces")
    private String username;

    @NotBlank(message = "password is required")
    @Size(min = 6, max = 100, message = "password must be between 6 and 100 characters")
    private String password;

    @NotNull(message = "role is required")
    private Role role;

    private Boolean isActive;
}
