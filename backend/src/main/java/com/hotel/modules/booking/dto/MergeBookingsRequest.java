package com.hotel.modules.booking.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class MergeBookingsRequest {
    private List<Long> bookingIds;
}
