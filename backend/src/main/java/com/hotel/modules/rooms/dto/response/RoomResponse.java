package com.hotel.modules.rooms.dto.response;

import com.hotel.modules.rooms.entity.Room;
import com.hotel.modules.rooms.entity.RoomTypeBed;
import com.hotel.modules.rooms.entity.enums.RoomStatus;
import lombok.*;
import java.util.List;
import java.util.ArrayList;

import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {
    private Long roomId;
    private String roomNumber;
    private Short floor;
    private BigDecimal pricePerNight;
    private List<String> imageUrls;
    private String description;
    private RoomStatus status;
    private Integer maxGuests;
    private Integer bedrooms;
    private Integer bathrooms;
    private Short areaSqm;
    private List<BedInfo> beds;

    //Thong tin phong
    private Integer typeId;
    private String typeName;

    //Thong tin khach san
    private Long hotelId;
    private String hotelName;
    private String province;
    private String district;
    private String address;

    @Getter @Setter @AllArgsConstructor @NoArgsConstructor
    public static class BedInfo {
        private String bedType;
        private int quantity;
        private String bedSize;
    }

    public static RoomResponse from(Room room) {
        if(room == null) return null;

        RoomResponse res = new RoomResponse();
        res.roomId       = room.getRoomId();
        res.roomNumber   = room.getRoomNumber();
        res.floor        = room.getFloor();
        res.imageUrls    = room.getImageUrls() != null && !room.getImageUrls().isEmpty() ? java.util.Arrays.asList(room.getImageUrls().split(",")) : new java.util.ArrayList<>();
        res.description  = (room.getDescription() != null && !room.getDescription().isEmpty()) ? room.getDescription() : (room.getRoomType() != null ? room.getRoomType().getDescription() : null);
        res.status       = room.getStatus();

        if (room.getRoomType() != null) {
            res.typeId = room.getRoomType().getTypeId();
            res.typeName = room.getRoomType().getTypeName();
            res.pricePerNight = room.getRoomType().getPricePerNight();
            res.maxGuests = room.getRoomType().getMaxGuests() != null ? room.getRoomType().getMaxGuests().intValue() : null;
            res.bedrooms = room.getRoomType().getBedrooms() != null ? room.getRoomType().getBedrooms().intValue() : 1;
            res.bathrooms = room.getRoomType().getBathrooms() != null ? room.getRoomType().getBathrooms().intValue() : 1;
            res.areaSqm = room.getRoomType().getAreaSqm();

            // Map beds from RoomType
            if (room.getRoomType().getBeds() != null) {
                res.beds = room.getRoomType().getBeds().stream()
                    .map(bed -> new BedInfo(
                        bed.getBedType().name(),
                        bed.getQuantity(),
                        bed.getBedSize()
                    ))
                    .toList();
            } else {
                res.beds = new ArrayList<>();
            }
        }

        if (room.getHotel() != null) {
            res.hotelId = room.getHotel().getHotelId();
            res.hotelName = room.getHotel().getHotelName();
            res.province = room.getHotel().getProvince();
            res.district = room.getHotel().getDistrict();
            res.address = room.getHotel().getAddress();
        }

        return res;
    }
}
