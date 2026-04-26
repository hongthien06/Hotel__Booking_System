package com.hotel.modules.auth.service;

import com.hotel.modules.auth.dto.UpdateProfileRequest;
import com.hotel.modules.auth.dto.UserResponse;
import com.hotel.modules.auth.entity.Role;
import com.hotel.modules.auth.entity.User;
import com.hotel.modules.auth.repository.RoleRepository;
import com.hotel.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với email: " + email));
    }

    public UserResponse getProfile() {
        User user = getCurrentUser();
        return mapToResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request) {
        User user = getCurrentUser();
        
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setUpdatedAt(java.time.LocalDateTime.now());
        
        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse updateRoles(Long userId, Set<String> roleNames) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Set<Role> roles = roleNames.stream()
                .map(name -> roleRepository.findByRoleName(name)
                        .orElseThrow(() -> new RuntimeException("Role " + name + " not found")))
                .collect(Collectors.toSet());

        user.setRoles(roles);
        user.setUpdatedAt(java.time.LocalDateTime.now());
        return mapToResponse(userRepository.save(user));
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .roles(user.getRoles().stream()
                        .map(r -> r.getRoleName())
                        .collect(Collectors.toSet()))
                .build();
    }
}
