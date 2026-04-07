package com.example.demo.dto;

import com.example.demo.entity.Role;

public class AuthResponse {
    private String token;
    private String refreshToken;
    private String username;
    private Role role;

    public AuthResponse() {
    }

    public AuthResponse(String token, String refreshToken, String username, Role role) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.username = username;
        this.role = role;
    }

    public AuthResponse(String token, String username, Role role) {
        this(token, null, username, role);
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
