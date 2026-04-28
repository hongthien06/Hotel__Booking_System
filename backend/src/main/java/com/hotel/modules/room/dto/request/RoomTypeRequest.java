package com.hotel.modules.room.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoomTypeRequest {
    @NotBlank
    @Size(max = 100)
    private String typeName;

    @Size(max = 500)
    private String description;
}
