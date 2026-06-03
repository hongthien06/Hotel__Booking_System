package com.hotel.modules.booking.entity;

import com.hotel.modules.rooms.entity.Room;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "BookingRooms")
public class BookingRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_room_id")
    private Long bookingRoomId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "room_price_snapshot", nullable = false, precision = 18, scale = 2)
    private BigDecimal roomPriceSnapshot;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;
}
