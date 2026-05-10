package com.hotel.modules.rooms.entity;

import com.hotel.modules.rooms.entity.enums.BedType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "RoomTypeBeds", schema = "dbo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoomTypeBed {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bed_id")
    private Integer bedId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_id", nullable = false)
    private RoomType roomType;

    @Enumerated(EnumType.STRING)
    @Column(name = "bed_type", nullable = false, length = 20)
    private BedType bedType;

    @Column(name = "quantity", nullable = false)
    private Byte quantity;

    @Column(name = "bed_size", length = 30)
    private String bedSize;
}
