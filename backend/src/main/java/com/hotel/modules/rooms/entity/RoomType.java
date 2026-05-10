package com.hotel.modules.rooms.entity;

import com.hotel.modules.hotel.entity.Hotel;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Set;
import java.util.LinkedHashSet;

@Entity
@Table(name="RoomTypes", schema = "dbo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoomType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "type_id")
    private Integer typeId;

    @Column(name="type_name", nullable=false, length=100)
    private String typeName;

    @Column(name="area_sqm")
    private Short areaSqm;

    @Column(name="max_guests", nullable=false)
    private Byte maxGuests;

    @Column(name="bedrooms", nullable=false)
    private Byte bedrooms = 1;

    @Column(name="bathrooms", nullable=false)
    private Byte bathrooms = 1;

    @Column(name="price_per_night", nullable=false, precision=18, scale=2)
    private BigDecimal pricePerNight;

    @Column(name="description", columnDefinition="NVARCHAR(MAX)")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @OneToMany(mappedBy = "roomType", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<RoomTypeBed> beds = new LinkedHashSet<>();
}
