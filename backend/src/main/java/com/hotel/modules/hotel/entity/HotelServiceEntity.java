package com.hotel.modules.hotel.entity;

import com.hotel.modules.booking_services.entity.ExtraService;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
class HotelServiceId implements Serializable {
    @Column(name = "hotel_id")
    private Long hotelId;

    @Column(name = "service_id")
    private Integer serviceId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof HotelServiceId that)) return false;
        return Objects.equals(hotelId, that.hotelId) && Objects.equals(serviceId, that.serviceId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(hotelId, serviceId);
    }
}

@Entity
@Table(name = "HotelServices", schema = "dbo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelServiceEntity {
    @EmbeddedId
    private HotelServiceId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("hotelId")
    @JoinColumn(name = "hotel_id")
    private Hotel hotel;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("serviceId")
    @JoinColumn(name = "service_id")
    private ExtraService service;

    @Column(name = "custom_price", precision = 18, scale = 2)
    private BigDecimal customPrice;
}
