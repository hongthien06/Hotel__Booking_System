package com.hotel.modules.booking.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class BookingRoomDTO {
    private Long roomId;
    private String roomNumber;
    private String roomTypeName;
    private String hotelName;
    private String hotelAddress;
    private BigDecimal roomPriceSnapshot;
    private Short totalNights;
    private BigDecimal subtotal;
}
