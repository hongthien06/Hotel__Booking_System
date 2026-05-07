package com.hotel.modules.hotel.dto.response;

import com.hotel.modules.hotel.entity.Hotel;
import lombok.*;

import java.util.List;
import java.util.stream.Collectors;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelResponse {
    private Long hotelId;
    private String hotelCode;
    private String hotelName;
    private String province;
    private String provinceCode;
    private String district;
    private String address;
    private Byte starRating;
    private String description;
    private String thumbnailUrl;
    private String imageUrls;
    private String phone;
    private String email;
    private Boolean isActive;
    private List<String> amenityNames; // Danh sách tên tiện ích của khách sạn

    public static HotelResponse from(Hotel hotel) {
        if (hotel == null) return null;
        List<String> amenities = hotel.getAmenities() == null ? List.of()
                : hotel.getAmenities().stream()
                        .map(a -> a.getAmenityName())
                        .sorted()
                        .collect(Collectors.toList());
        return HotelResponse.builder()
                .hotelId(hotel.getHotelId())
                .hotelCode(hotel.getHotelCode())
                .hotelName(hotel.getHotelName())
                .province(hotel.getProvince())
                .provinceCode(hotel.getProvinceCode())
                .district(hotel.getDistrict())
                .address(hotel.getAddress())
                .starRating(hotel.getStarRating())
                .description(hotel.getDescription())
                .thumbnailUrl(hotel.getThumbnailUrl())
                .imageUrls(hotel.getImageUrls())
                .phone(hotel.getPhone())
                .email(hotel.getEmail())
                .isActive(hotel.getIsActive())
                .amenityNames(amenities)
                .build();
    }
}
