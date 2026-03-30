package com.example.demo.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.demo.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    // Chức năng: xử lý should not filter.
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path != null && path.startsWith("/api/auth/");
    }

    @Override
    // Chức năng: xử lý do filter internal.
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Lấy header
        String authHeader = request.getHeader("Authorization");

        // 2. Nếu không có token → bỏ qua
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Cắt token
        String token = authHeader.substring(7);

        try {
            // 4. Lấy username + role từ token
            String username = jwtService.extractUsername(token);
            String role = jwtService.extractRole(token);

            if (!role.startsWith("ROLE_")) {
                role = "ROLE_" + role;
            }

            SimpleGrantedAuthority authority = new SimpleGrantedAuthority(role);

            // 6. Tạo Authentication object
            UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                    username,
                    null,
                    List.of(authority)
                );

            // 7. Set vào SecurityContext (QUAN TRỌNG NHẤT)
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Debug
            System.out.println("Authenticated user: " + username + " - Role: " + role);
        } catch (Exception ex) {
            // Token lỗi/hết hạn: xóa context để request protected bị chặn theo cấu hình.
            SecurityContextHolder.clearContext();
        }

        // 8. Cho request đi tiếp
        filterChain.doFilter(request, response);
    }
}

