package com.hotel.modules.hotel.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Amenities", schema = "dbo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Amenity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "amenity_id")
    private Integer amenityId;

    @Column(name = "amenity_name", nullable = false, length = 100, unique = true)
    private String amenityName;

    @Column(name = "icon_class", length = 100)
    private String iconClass;

    @Column(name = "description", length = 255)
    private String description;
}
