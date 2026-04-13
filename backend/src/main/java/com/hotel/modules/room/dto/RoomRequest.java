package com.hotel.modules.room.dto;

import com.hotel.modules.room.entity.BedType;
import com.hotel.modules.room.entity.RoomStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter @Setter
public class RoomRequest {
    @NotNull
    private Integer typeId;

    @NotBlank
    private String roomNumber;

    private Short floor;

    @NotNull
    private BedType bedType;

    @NotBlank
    private String province;

    @NotBlank
    private String district;
    private String address;

    @NotNull
    @DecimalMin(value = "0.0")
    private BigDecimal pricePerNight;

    private String thumbnailUrl;
    private String imageUrls;
    private String description;

    @NotNull
    private RoomStatus status;
}
