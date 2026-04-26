package com.hotel.modules.booking_services.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "ExtraServices", schema = "dbo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExtraService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "service_id")
    private Integer serviceId;

    @Column(name = "service_name", nullable = false, length = 150)
    private String serviceName;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "unit_price", nullable = false, precision = 18, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "price_type", nullable = false, length = 20)
    private String priceType = "PER_BOOKING"; // PER_BOOKING, PER_NIGHT, PER_PERSON

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
