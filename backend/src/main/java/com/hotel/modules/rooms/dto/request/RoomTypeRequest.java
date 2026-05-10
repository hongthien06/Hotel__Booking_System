package com.hotel.modules.rooms.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoomTypeRequest {
    @NotNull
    private Long hotelId;

    @NotBlank
    @Size(max = 100)
    private String typeName;

    private Short areaSqm;

    private Byte maxGuests;

    private Byte bedrooms;

    private Byte bathrooms;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal pricePerNight;

    @Size(max = 500)
    private String description;

    private List<BedRequest> beds;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class BedRequest {
        private String bedType;
        private Byte quantity;
        private String bedSize;
    }
}
