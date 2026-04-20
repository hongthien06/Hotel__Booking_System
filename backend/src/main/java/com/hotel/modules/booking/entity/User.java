package com.hotel.modules.booking.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Entity(name = "AuthUser")
@Table(name = "Users")
public class User {

    @Setter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Setter
    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Setter
    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Setter
    @Column(name = "phone", length = 20)
    private String phone;

    @Setter
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Setter
    @Column(name = "refresh_token", length = 512)
    private String refreshToken;

    @Setter
    @Column(name = "avatar_url", length = 512)
    private String avatarUrl;

    @Setter
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Quan hệ với UserRoles (1 user có nhiều role)
    @Setter
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<UserRole> userRoles;

    // Quan hệ với Bookings (1 user có nhiều booking)
    @Setter
    @OneToMany(mappedBy = "user")
    private List<Booking> bookings;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ===== Getters & Setters =====

}