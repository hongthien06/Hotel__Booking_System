package com.hotel.modules.email.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailRequest {
    private String toEmail;
    private String buildingName;
    private String buildingAdress;
    private String customerName;
    private String customerPhone;
    private String codeBooking;
    private String dateBooking;
    private String dateCheckin;
    private String timeCheckin;
    private String dateCheckout;
    private String timeCheckout;
    private Integer night;
    private Integer people;
    private Long priceBooking;
    private Long priceBreakfast;
    private Long feeService;
    private Long tax;
    private Long totalPrice;

}
