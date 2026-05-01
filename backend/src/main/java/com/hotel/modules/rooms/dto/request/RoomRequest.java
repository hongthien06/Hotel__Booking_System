package com.hotel.modules.rooms.dto.request;

import com.hotel.modules.rooms.entity.enums.BedType;
import com.hotel.modules.rooms.entity.enums.RoomStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoomRequest {
    @NotNull
    private Long hotelId;

    @NotNull
    private Integer typeId;

    @NotBlank
    @Size(max=30)
    private String roomNumber;

    private Short floor;

    @NotNull
    private BedType bedType;

    @NotNull
    @DecimalMin(value = "0.0",inclusive = false)
    private BigDecimal pricePerNight;

    private String imageUrls;
    private String description;

    @NotNull
    private RoomStatus status;
}
