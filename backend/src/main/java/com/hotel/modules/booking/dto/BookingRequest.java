package com.hotel.modules.booking.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
public class BookingRequest {
    private Long roomId;
    private List<Long> roomIds;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private Byte numAdults;
    private Byte numChildren;
    private String specialRequest;
    private LocalTime expectedCheckoutTime;
}
