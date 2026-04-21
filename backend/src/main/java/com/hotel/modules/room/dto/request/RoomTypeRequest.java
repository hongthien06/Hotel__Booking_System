package com.hotel.modules.room.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
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
