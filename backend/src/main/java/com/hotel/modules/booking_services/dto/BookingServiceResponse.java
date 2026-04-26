package com.hotel.modules.booking_services.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class BookingServiceResponse {
    private Integer serviceId;
    private String serviceName;
    private Short quantity;
    private BigDecimal unitPriceSnap;
    private BigDecimal subtotal;
}
