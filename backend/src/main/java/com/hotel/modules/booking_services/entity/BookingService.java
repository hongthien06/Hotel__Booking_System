package com.hotel.modules.booking_services.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hotel.modules.booking.entity.Booking;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "BookingServices", schema = "dbo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookingService {

    @EmbeddedId
    private BookingServiceId id = new BookingServiceId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("bookingId")
    @JoinColumn(name = "booking_id")
    @JsonIgnore
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("serviceId")
    @JoinColumn(name = "service_id")
    private ExtraService extraService;

    @Column(name = "quantity", nullable = false)
    private Short quantity = 1;

    @Column(name = "unit_price_snap", nullable = false, precision = 18, scale = 2)
    private BigDecimal unitPriceSnap;

    @Column(name = "subtotal", insertable = false, updatable = false, precision = 18, scale = 2)
    private BigDecimal subtotal;
}
