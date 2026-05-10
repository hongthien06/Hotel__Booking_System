package com.hotel.modules.rooms.dto.response;

import com.hotel.modules.rooms.entity.RoomType;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoomTypeResponse {
    private Integer typeId;
    private String typeName;
    private Short areaSqm;
    private Integer maxGuests;
    private Integer bedrooms;
    private Integer bathrooms;
    private BigDecimal pricePerNight;
    private String description;
    private List<RoomResponse.BedInfo> beds;
    private Long hotelId;
    private String hotelName;

    public static RoomTypeResponse from(RoomType roomType) {
        if (roomType == null) return null;

        RoomTypeResponse res = new RoomTypeResponse();
        res.typeId = roomType.getTypeId();
        res.typeName = roomType.getTypeName();
        res.areaSqm = roomType.getAreaSqm();
        res.maxGuests = roomType.getMaxGuests() != null ? roomType.getMaxGuests().intValue() : null;
        res.bedrooms = roomType.getBedrooms() != null ? roomType.getBedrooms().intValue() : 1;
        res.bathrooms = roomType.getBathrooms() != null ? roomType.getBathrooms().intValue() : 1;
        res.pricePerNight = roomType.getPricePerNight();
        res.description = roomType.getDescription();

        if (roomType.getHotel() != null) {
            res.hotelId = roomType.getHotel().getHotelId();
            res.hotelName = roomType.getHotel().getHotelName();
        }

        if (roomType.getBeds() != null) {
            res.beds = roomType.getBeds().stream()
                .map(bed -> new RoomResponse.BedInfo(
                    bed.getBedType().name(),
                    bed.getQuantity(),
                    bed.getBedSize()
                ))
                .toList();
        } else {
            res.beds = new ArrayList<>();
        }

        return res;
    }
}
