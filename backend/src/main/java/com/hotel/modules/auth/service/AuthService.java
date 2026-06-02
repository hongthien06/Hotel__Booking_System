package com.hotel.modules.auth.service;

import com.hotel.common.config.JwtService;
import com.hotel.modules.auth.dto.*;
import com.hotel.modules.auth.entity.Role;
import com.hotel.modules.auth.entity.User;
import com.hotel.modules.auth.entity.VerificationToken;
import com.hotel.modules.auth.repository.RoleRepository;
import com.hotel.modules.auth.repository.UserRepository;
import com.hotel.modules.auth.repository.VerificationTokenRepository;
import com.hotel.modules.email.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository userRepository;
        private final RoleRepository roleRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;
        private final EmailService emailService;
        private final VerificationTokenRepository verificationTokenRepository;

        private static final SecureRandom RANDOM = new SecureRandom();

        @Value("${app.frontend-url}")
        private String frontendUrl;

        // ── Đăng ký (giữ backward compat) ────────────────────
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
                                .roles(user.getRoles().stream()
                                                .map(r -> r.getRoleName())
                                                .collect(Collectors.toSet()))
                                .build();
        }

        // ── Đăng ký Bước 1: Gửi OTP ─────────────────────────
        @Transactional
        public Map<String, String> registerInit(RegisterRequest request) {
                // Kiểm tra email đã tồn tại chưa
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("Email đã được sử dụng!");
                }

                // Xóa OTP cũ nếu có
                verificationTokenRepository.deleteByEmail(request.getEmail());

                // Tạo mã OTP 6 chữ số
                String otpCode = String.format("%06d", RANDOM.nextInt(1000000));

                // Lưu thông tin đăng ký tạm + OTP
                VerificationToken token = VerificationToken.builder()
                                .email(request.getEmail())
                                .otpCode(otpCode)
                                .fullName(request.getFullName())
                                .phone(request.getPhone())
                                .passwordHash(passwordEncoder.encode(request.getPassword()))
                                .expiresAt(LocalDateTime.now().plusMinutes(5))
                                .build();
                verificationTokenRepository.save(token);

                // Gửi email chứa OTP
                emailService.sendOtpEmail(request.getEmail(), otpCode, request.getFullName());

                return Map.of("message", "Mã OTP đã được gửi đến email " + request.getEmail());
        }

        // ── Đăng ký Bước 2: Xác nhận OTP ────────────────────
        @Transactional
        public AuthResponse registerVerify(VerifyOtpRequest request) {
                VerificationToken token = verificationTokenRepository
                                .findByEmailAndOtpCode(request.getEmail(), request.getOtpCode())
                                .orElseThrow(() -> new RuntimeException("Mã OTP không chính xác!"));

                if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
                        verificationTokenRepository.delete(token);
                        throw new RuntimeException("Mã OTP đã hết hạn! Vui lòng yêu cầu gửi lại.");
                }

                // Kiểm tra lại email trùng (phòng race condition)
                if (userRepository.existsByEmail(request.getEmail())) {
                        verificationTokenRepository.delete(token);
                        throw new RuntimeException("Email đã được sử dụng!");
                }

                // Lấy quyền CUSTOMER
                Role customerRole = roleRepository.findByRoleName("CUSTOMER")
                                .orElseGet(() -> {
                                        Role r = new Role();
                                        r.setRoleName("CUSTOMER");
                                        r.setDescription("Khách hàng mặc định");
                                        return roleRepository.save(r);
                                });
                Set<Role> roles = new HashSet<>();
                roles.add(customerRole);

                // Tạo user thật từ thông tin trong token
                User user = User.builder()
                                .fullName(token.getFullName())
                                .email(token.getEmail())
                                .passwordHash(token.getPasswordHash())
                                .phone(token.getPhone())
                                .roles(roles)
                                .isActive(true)
                                .createdAt(LocalDateTime.now())
                                .updatedAt(LocalDateTime.now())
                                .build();
                userRepository.save(user);

                // Xóa token sau khi verify thành công
                verificationTokenRepository.deleteByEmail(request.getEmail());

                // Gửi email chúc mừng đăng ký
                emailService.sendRegistrationSuccessEmail(token.getEmail(), token.getFullName());

                // Tạo JWT token
                String jwtToken = jwtService.generateAccessToken(user);
                return AuthResponse.builder()
                                .token(jwtToken)
                                .email(user.getEmail())
                                .fullName(user.getFullName())
                                .message("Đăng ký thành công!")
                                .roles(user.getRoles().stream()
                                                .map(r -> r.getRoleName())
                                                .collect(Collectors.toSet()))
                                .build();
        }

        // ── Đăng nhập ─────────────────────────────────────────
        public AuthResponse login(LoginRequest request) {
                // Spring Security tự kiểm tra email + password
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

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
                                .roles(user.getRoles().stream()
                                                .map(r -> r.getRoleName())
                                                .collect(Collectors.toSet()))
                                .build();
        }

        // ── Quên mật khẩu ──────────────────────────────────────
        public void forgotPassword(ForgotPasswordRequest request) {
                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với email này!"));

                // Tạo token ngẫu nhiên (UUID)
                String token = java.util.UUID.randomUUID().toString();
                user.setResetToken(token);
                user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(3)); // Hết hạn sau 3 phút
                userRepository.save(user);

                System.out.println(">>> RESET TOKEN for " + user.getEmail() + ": " + token);
                System.out.println(">>> RESET LINK: " + frontendUrl + "/reset-password?token=" + token);

                // Gửi email (link này sẽ trỏ về Frontend)
                String resetLink = frontendUrl + "/reset-password?token=" + token;
                String emailContent = "Chào " + user.getFullName() + ",\n\n" +
                                "Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng click vào link sau để thực hiện:\n" +
                                resetLink + "\n\n" +
                                "Link này sẽ hết hạn sau 3 phút. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.";

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

        // ── Đổi mật khẩu (khi đã đăng nhập) ─────────────────────
        public void changePassword(String email, ChangePasswordRequest request) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản!"));

                // Kiểm tra mật khẩu cũ
                if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
                        throw new RuntimeException("Mật khẩu cũ không chính xác!");
                }

                // Cập nhật mật khẩu mới
                user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
                userRepository.save(user);
        }
}