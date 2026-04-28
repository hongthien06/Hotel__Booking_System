package com.hotel.modules.room.dto.response;

import com.hotel.modules.room.entity.RoomType;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoomTypeResponse {
    private Integer typeId;
    private String typeName;
    private String description;

    public static RoomTypeResponse from(RoomType roomType) {
        if (roomType == null) return null;

        RoomTypeResponse res = new RoomTypeResponse();
        res.typeId=roomType.getTypeId();
        res.typeName=roomType.getTypeName();
        res.description=roomType.getDescription();
        return res;
    }

}
