package com.hotel.modules.room.entity;

import com.hotel.modules.hotel.entity.Hotel;
import com.hotel.modules.room.entity.enums.BedType;
import com.hotel.modules.room.entity.enums.RoomStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Rooms", schema = "dbo", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"hotel_id", "room_number"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long roomId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_id", nullable = false)
    private RoomType roomType;

    @Column(name = "room_number", nullable = false, length = 30)
    private String roomNumber;

    @Column(name = "floor")
    private Short floor;

    @Enumerated(EnumType.STRING)
    @Column(name = "bed_type", nullable = false, length = 20)
    private BedType bedType;

    @Column(name = "price_per_night", nullable = false, precision = 18, scale = 2)
    private BigDecimal pricePerNight;

    @Column(name = "image_urls", columnDefinition = "NVARCHAR(MAX)")
    private String imageUrls;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private RoomStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

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
