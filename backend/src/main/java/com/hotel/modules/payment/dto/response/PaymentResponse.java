package com.hotel.modules.payment.dto.response;

import com.hotel.modules.payment.entity.PaymentGateway;
import com.hotel.modules.payment.entity.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponse {
    private Long paymentId;
    private String transactionId;
    private BigDecimal amount;
    private String currency;
    private PaymentGateway gateway;
    private PaymentStatus status;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}
