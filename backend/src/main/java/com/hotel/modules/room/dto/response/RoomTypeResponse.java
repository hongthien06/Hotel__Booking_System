package com.hotel.modules.room.dto.response;

import com.hotel.modules.room.entity.RoomType;
import lombok.*;

import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoomTypeResponse {
    private Integer typeId;
    private String typeName;
    private String description;
    private BigDecimal basePrice;
    private Byte maxOccupancy;

    public static RoomTypeResponse from(RoomType roomType) {
        if (roomType == null) return null;

        RoomTypeResponse res = new RoomTypeResponse();
        res.typeId=roomType.getTypeId();
        res.typeName=roomType.getTypeName();
        res.description=roomType.getDescription();
        res.basePrice=roomType.getBasePrice();
        res.maxOccupancy=roomType.getMaxOccupancy();
        return res;
    }

}
