package com.hotel.modules.auth.service;

import com.hotel.common.config.JwtService;
import com.hotel.modules.auth.dto.*;
import com.hotel.modules.auth.entity.Role;
import com.hotel.modules.auth.entity.User;
import com.hotel.modules.auth.repository.RoleRepository;
import com.hotel.modules.auth.repository.UserRepository;
import com.hotel.modules.email.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    // ── Đăng ký ───────────────────────────────────────────
    public AuthResponse register(RegisterRequest request) {
        // Kiểm tra email đã tồn tại chưa
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng!");
        }

        // Lấy quyền CUSTOMER mặc định
        Role customerRole = roleRepository.findByRoleName("CUSTOMER")
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setRoleName("CUSTOMER");
                    r.setDescription("Khách hàng mặc định");
                    return roleRepository.save(r);
                });
        Set<Role> roles = new HashSet<>();
        roles.add(customerRole);

        // Tạo user mới
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .roles(roles)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        // Tạo token sau khi đăng ký
        String token = jwtService.generateAccessToken(user);
        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .message("Đăng ký thành công!")
                .build();
    }

    // ── Đăng nhập ─────────────────────────────────────────
    public AuthResponse login(LoginRequest request) {
        // Spring Security tự kiểm tra email + password
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // Lấy user từ DB
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản!"));

        // Tạo token
        String token = jwtService.generateAccessToken(user);

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .message("Đăng nhập thành công!")
                .build();
    }

    // ── Quên mật khẩu ──────────────────────────────────────
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với email này!"));

        // Tạo token ngẫu nhiên (UUID)
        String token = java.util.UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1)); // Hết hạn sau 1 giờ
        userRepository.save(user);

        // Gửi email (link này sẽ trỏ về Frontend)
        String resetLink = "http://localhost/reset-password?token=" + token;
        String emailContent = "Chào " + user.getFullName() + ",\n\n" +
                "Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng click vào link sau để thực hiện:\n" +
                resetLink + "\n\n" +
                "Link này sẽ hết hạn sau 1 giờ. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.";

        emailService.sendMail(user.getEmail(), "Khôi phục mật khẩu - Hotel Booking", emailContent);
    }

    // ── Đặt lại mật khẩu ────────────────────────────────────
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Token không hợp lệ hoặc đã hết hạn!"));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token đã hết hạn!");
        }

        // Cập nhật mật khẩu mới
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }
}