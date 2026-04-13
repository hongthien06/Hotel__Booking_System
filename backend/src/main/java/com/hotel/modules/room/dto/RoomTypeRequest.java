package com.hotel.modules.room.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter @Setter
public class RoomTypeRequest {
    @NotBlank
    @Size(max = 100)
    private String typeName;

    @Size(max = 500)
    private String description;

    @NotNull
    @DecimalMin(value="0.0",inclusive=false)
    private BigDecimal basePrice;

    @NotNull
    @Min(value = 1)
    @Max(value = 10)
    private Byte maxOccupancy;

}
