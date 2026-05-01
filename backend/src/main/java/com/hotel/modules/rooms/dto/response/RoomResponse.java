package com.hotel.modules.rooms.dto.response;

import com.hotel.modules.rooms.entity.enums.BedType;
import com.hotel.modules.rooms.entity.Room;
import com.hotel.modules.rooms.entity.enums.RoomStatus;
import lombok.*;

import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {
    private Long roomId;
    private String roomNumber;
    private Short floor;
    private BedType bedType;
    private BigDecimal pricePerNight;
    private String imageUrls;
    private String description;
    private RoomStatus status;

    //Thong tin phong
    private Integer typeId;
    private String typeName;

    //Thong tin khach san
    private Long hotelId;
    private String hotelName;
    private String province;
    private String district;

    public static RoomResponse from(Room room) {
        if(room == null) return null;

        RoomResponse res = new RoomResponse();
        res.roomId       = room.getRoomId();
        res.roomNumber   = room.getRoomNumber();
        res.floor        = room.getFloor();
        res.bedType      = room.getBedType();
        res.pricePerNight = room.getPricePerNight();
        res.imageUrls    = room.getImageUrls();
        res.description  = room.getDescription();
        res.status       = room.getStatus();

        if (room.getRoomType() != null) {
            res.typeId = room.getRoomType().getTypeId();
            res.typeName = room.getRoomType().getTypeName();
        }

        if (room.getHotel() != null) {
            res.hotelId = room.getHotel().getHotelId();
            res.hotelName = room.getHotel().getHotelName();
            res.province = room.getHotel().getProvince();
            res.district = room.getHotel().getDistrict();
        }

        return res;
    }
}
