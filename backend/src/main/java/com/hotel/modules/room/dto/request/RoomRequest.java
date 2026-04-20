package com.hotel.modules.room.dto.request;

import com.hotel.modules.room.entity.enums.BedType;
import com.hotel.modules.room.entity.enums.RoomStatus;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoomRequest {
    @NotNull
    private Integer typeId;

    @NotBlank
    @Size(max=20)
    private String roomNumber;

    private Short floor;

    @NotNull
    private BedType bedType;

    @NotBlank
    @Size(max=100)
    private String province;

    @NotBlank
    @Size(max=100)
    private String district;
    @Size(max=500)
    private String address;

    @NotNull
    @DecimalMin(value = "0.0",inclusive = false)
    private BigDecimal pricePerNight;

    private String thumbnailUrl;
    private String imageUrls;
    private String description;

    @NotNull
    private RoomStatus status;
}
