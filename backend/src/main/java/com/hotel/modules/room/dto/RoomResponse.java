package com.hotel.modules.room.dto;

import com.hotel.modules.room.entity.BedType;
import com.hotel.modules.room.entity.Room;
import com.hotel.modules.room.entity.RoomStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter @Setter
public class RoomResponse {
    private Long roomId;
    private String roomNumber;
    private Short floor;
    private BedType bedType;
    private String province;
    private String district;
    private String address;
    private BigDecimal pricePerNight;
    private String thumbnailUrl;
    private String imageUrls;
    private String description;
    private RoomStatus status;

    //Thong tin phong
    private Integer typeId;
    private String typeName;

    public static RoomResponse from(Room room) {
        if(room == null) return null;

        RoomResponse res = new RoomResponse();
        res.roomId       = room.getRoomId();
        res.roomNumber   = room.getRoomNumber();
        res.floor        = room.getFloor();
        res.bedType      = room.getBedType();
        res.province     = room.getProvince();
        res.district     = room.getDistrict();
        res.address      = room.getAddress();
        res.pricePerNight = room.getPricePerNight();
        res.thumbnailUrl = room.getThumbnailUrl();
        res.imageUrls    = room.getImageUrls();
        res.description  = room.getDescription();
        res.status       = room.getStatus();
        if (room.getRoomType() != null) {
            res.typeId = room.getRoomType().getTypeId();
            res.typeName = room.getRoomType().getTypeName();
        }
        return res;
    }
}
