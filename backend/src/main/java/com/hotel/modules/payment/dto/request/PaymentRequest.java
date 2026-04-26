package com.hotel.modules.payment.dto.request;

import java.math.BigDecimal;

import com.hotel.modules.booking.entity.Booking;
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
  private Long bookingId;
  private BigDecimal amount;
  private PaymentGateway gateway;
}
