package com.hotel.modules.auth.controller;

import com.hotel.modules.auth.dto.UserResponse;
import com.hotel.modules.auth.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Các API dành cho Admin/Manager quản lý người dùng")
public class AdminUserController {

    private final UserService userService;

    @Operation(summary = "Lấy danh sách tất cả người dùng")
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @Operation(summary = "Cập nhật quyền của người dùng")
    @PutMapping("/{userId}/roles")
    public ResponseEntity<UserResponse> updateUserRoles(
            @PathVariable Long userId,
            @RequestBody Set<String> roles) {
        return ResponseEntity.ok(userService.updateRoles(userId, roles));
    }
}
