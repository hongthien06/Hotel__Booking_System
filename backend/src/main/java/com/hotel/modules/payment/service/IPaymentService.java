package com.hotel.modules.payment.service;

import com.hotel.modules.payment.dto.request.PaymentRequest;
import com.hotel.modules.payment.dto.response.PaymentCreateResponse;
import com.hotel.modules.payment.entity.Payment;

public interface IPaymentService {
  public PaymentCreateResponse createInitialPayment(PaymentRequest request, String ipAdress);

  public Payment findByBookingCode(String bookingCode);

  public Payment findByPaymentId(Long paymentId);

  public Payment findByBookingId(Long bookingId);

  public void updatePaymentResult(Payment payment,
      String gatewayTransactionNo,
      String rawResponse,
      boolean isSuccess);
}
