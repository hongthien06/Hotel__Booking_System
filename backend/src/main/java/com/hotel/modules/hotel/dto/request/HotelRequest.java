package com.hotel.modules.hotel.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelRequest {
    @NotBlank
    @Size(max = 20)
    private String hotelCode;

    @NotBlank
    @Size(max = 255)
    private String hotelName;

    @NotBlank
    @Size(max = 100)
    private String province;

    @NotBlank
    @Size(max = 10)
    private String provinceCode;

    @NotBlank
    @Size(max = 100)
    private String district;

    @Size(max = 500)
    private String address;

    @Min(1) @Max(5)
    private Byte starRating;

    private String description;
    private String thumbnailUrl;
    private String imageUrls;
    private String phone;
    private String email;
}
