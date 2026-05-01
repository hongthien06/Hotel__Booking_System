package com.hotel.modules.hotel.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Hotels", schema = "dbo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hotel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "hotel_id")
    private Long hotelId;

    @Column(name = "hotel_code", nullable = false, length = 20, unique = true)
    private String hotelCode;

    @Column(name = "hotel_name", nullable = false, length = 255)
    private String hotelName;

    @Column(name = "province", nullable = false, length = 100)
    private String province;

    @Column(name = "province_code", nullable = false, length = 10)
    private String provinceCode;

    @Column(name = "district", nullable = false, length = 100)
    private String district;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "star_rating")
    private Byte starRating;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "thumbnail_url", length = 512)
    private String thumbnailUrl;

    @Column(name = "image_urls", columnDefinition = "NVARCHAR(MAX)")
    private String imageUrls;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToMany
    @JoinTable(
        name = "HotelAmenityMap",
        schema = "dbo",
        joinColumns = @JoinColumn(name = "hotel_id"),
        inverseJoinColumns = @JoinColumn(name = "amenity_id")
    )
    private java.util.Set<Amenity> amenities = new java.util.HashSet<>();

    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL)
    private java.util.List<com.hotel.modules.rooms.entity.Room> rooms = new java.util.ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
