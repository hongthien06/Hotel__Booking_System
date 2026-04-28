package com.hotel.modules.booking.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class BookingRequest {
    private Long roomId;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private Byte numAdults;
    private Byte numChildren;
    private String specialRequest;
}