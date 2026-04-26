package com.hotel.modules.booking_services.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ExtraServiceDTO {
    private Integer serviceId;
    private String serviceName;
    private String description;
    private BigDecimal unitPrice;
    private String priceType;
    private Boolean isActive;
}
