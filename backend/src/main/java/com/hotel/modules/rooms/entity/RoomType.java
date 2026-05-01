package com.hotel.modules.rooms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    @Column(name="type_name", nullable=false, length=100, unique=true)
    private String typeName;

    @Column(name="description", length=500)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private com.hotel.modules.hotel.entity.Hotel hotel;
}

