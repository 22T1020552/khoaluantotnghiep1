package com.example.demo.dto;

import com.example.demo.entity.Role;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminUpdateUserRequest {

    @Pattern(regexp = "^[a-zA-Z0-9._-]{4,50}$", message = "username must be 4-50 chars and contain no spaces")
    private String username;

    @Size(min = 6, max = 100, message = "password must be between 6 and 100 characters")
    private String password;

    private Role role;

    private Boolean isActive;
}
