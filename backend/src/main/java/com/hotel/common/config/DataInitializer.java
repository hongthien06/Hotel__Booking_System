package com.hotel.common.config;

import com.hotel.modules.auth.entity.Role;
import com.hotel.modules.auth.entity.User;
import com.hotel.modules.auth.repository.RoleRepository;
import com.hotel.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        Role adminRole = createRoleIfNotFound("ADMIN", "Quản trị viên hệ thống");
        Role managerRole = createRoleIfNotFound("MANAGER", "Quản lý khách sạn");
        createRoleIfNotFound("CUSTOMER", "Khách hàng");

        // Tạo Admin mặc định
        createDefaultUser("admin@hotel.com", "123456", "System Admin", adminRole);
        // Tạo một Manager mặc định
        createDefaultUser("manager@hotel.com", "123456", "Hotel Manager", managerRole);
    }

    private void createDefaultUser(String email, String password, String name, Role role) {
        if (!userRepository.existsByEmail(email)) {
            Set<Role> roles = new HashSet<>();
            roles.add(role);
            User user = User.builder()
                    .fullName(name)
                    .email(email)
                    .passwordHash(passwordEncoder.encode(password))
                    .roles(roles)
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            userRepository.save(user);
            System.out.println(">>> Created user: " + email);
        }
    }

    private Role createRoleIfNotFound(String name, String description) {
        return roleRepository.findByRoleName(name)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setRoleName(name);
                    role.setDescription(description);
                    return roleRepository.save(role);
                });
    }
}
