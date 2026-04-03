package com.example.demo.dto;

import com.example.demo.entity.Role;

import lombok.Data;

@Data
public class AdminUserResponse {
    private Long id;
    private String username;
    private Role role;
    private Boolean isActive;

    public AdminUserResponse() {
    }

    public AdminUserResponse(Long id, String username, Role role, Boolean isActive) {
        this.id = id;
        this.username = username;
        this.role = role;
        this.isActive = isActive;
    }
}
