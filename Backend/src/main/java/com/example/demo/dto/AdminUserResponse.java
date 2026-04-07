package com.example.demo.dto;

import java.time.LocalDateTime;

import com.example.demo.entity.Role;

import lombok.Data;

@Data
public class AdminUserResponse {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String phoneNumber;
    private Role role;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public AdminUserResponse() {
    }

    public AdminUserResponse(
            Long id,
            String username,
            String fullName,
            String email,
            String phoneNumber,
            Role role,
            Boolean isActive,
            LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.role = role;
        this.isActive = isActive;
        this.createdAt = createdAt;
    }
}
