package com.hotel.modules.rooms.dto.request;

import com.hotel.modules.rooms.entity.enums.RoomStatus;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.*;

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

    private List<String> imageUrls;
    private String description;

    @NotNull
    private RoomStatus status;

    private Integer bedrooms;
    private Integer bathrooms;
}
