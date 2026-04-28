package com.hotel.modules.room.entity.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum BedType {
    SINGLE(2, 1),
    DOUBLE(4, 2),
    TRIPLE(6, 3),
    KING(2, 1),
    QUEEN(2, 1);

    private final int maxAdults;
    private final int maxChildren;
}
