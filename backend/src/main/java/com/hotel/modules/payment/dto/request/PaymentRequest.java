package com.hotel.modules.payment.dto.request;

import java.math.BigDecimal;

import com.hotel.modules.payment.entity.PaymentGateway;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
  private String bookingCode;
  private BigDecimal amount;
  private PaymentGateway gateway;
}
