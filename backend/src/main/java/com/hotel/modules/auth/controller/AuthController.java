package com.hotel.modules.auth.controller;

import com.hotel.modules.auth.dto.*;
import com.hotel.modules.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Các API liên quan đến Đăng nhập và Đăng ký")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Đăng ký tài khoản mới", description = "Tạo một tài khoản khách hàng mới mang quyền CUSTOMER")
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse result = authService.register(request);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Đăng nhập", description = "Đăng nhập để nhận chuỗi xác thực JWT Token dùng cho các API khác")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse result = authService.login(request);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Quên mật khẩu", description = "Gửi link khôi phục mật khẩu qua email")
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok("Link khôi phục mật khẩu đã được gửi vào email của bạn.");
    }

    @Operation(summary = "Đặt lại mật khẩu", description = "Sử dụng token từ email để thiết lập mật khẩu mới")
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("Mật khẩu của bạn đã được thay đổi thành công.");
    }
}