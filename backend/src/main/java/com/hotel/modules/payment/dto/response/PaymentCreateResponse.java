package com.hotel.modules.payment.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCreateResponse {
  private String paymnent_url;
  private String bookingCode;
  private PaymentResponse payment;
}
