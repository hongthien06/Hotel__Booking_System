package com.hotel.modules.payment.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MoMoRequest {
    private String orderId;
    private Long amount;
    private String requestId;
    private String extraData;
}
