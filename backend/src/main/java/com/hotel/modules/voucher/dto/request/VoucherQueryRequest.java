package com.hotel.modules.voucher.dto.request;

import lombok.Data;

@Data
public class VoucherQueryRequest {
    private int page = 0;
    private int size = 10;
    private String status;  // ACTIVE | INACTIVE
    private String code;    // tim kiem theo ma (partial match)
}
