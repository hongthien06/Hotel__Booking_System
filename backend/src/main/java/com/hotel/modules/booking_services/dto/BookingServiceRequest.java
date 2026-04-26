package com.hotel.modules.booking_services.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookingServiceRequest {

    @NotNull(message = "Service ID is required")
    private Integer serviceId;

    @Min(value = 1, message = "Quantity must be at least 1")
    private Short quantity = 1;
}
