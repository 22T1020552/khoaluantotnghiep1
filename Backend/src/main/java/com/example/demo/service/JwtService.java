package com.example.demo.service;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private static final String SECRET = "mysecretkey-mysecretkey-mysecretkey-123";

    private final SecretKey key = Keys.hmacShaKeyFor(
            SECRET.getBytes(StandardCharsets.UTF_8)
    );

    //  TẠO TOKEN
    // Chức năng: xử lý tạo token.
    public String generateToken(String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(key) 
                .compact();
    }

    // PARSE TOKEN CHUNG
    // Chức năng: xử lý trích xuất tất cả các yêu cầu.
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    //  Lấy USERNAME
    // Chức năng: xử lý trích xuất username.
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    // Lấy ROLE 
    // Chức năng: xử lý trích xuất tất cả các vai trò.
    public String extractRole(String token) {
        return (String) extractAllClaims(token).get("role");
    }
}

