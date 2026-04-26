package com.hotel.modules.payment.service;

import com.hotel.modules.email.service.EmailService;
import com.hotel.modules.payment.constant.MomoIpnResponseConst;
import com.hotel.modules.payment.dto.response.IpnResponse;
import com.hotel.modules.payment.entity.Payment;
import com.hotel.modules.payment.entity.PaymentStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service("momoIpnHandler")
@RequiredArgsConstructor
public class MomoIpnHandler implements IpnHandler {
    private final IMomoService momoService;
    private final PaymentService paymentService;
    private final EmailService emailService;

    @Override
    @Transactional
    public IpnResponse process(Map<String, String> params) {
        if (!momoService.verifyIpn(params)) {
            return MomoIpnResponseConst.SIGNATURE_MISMATCH;
        }

        String orderId = params.get("orderId"); // bookingCode
        String resultCode = params.get("resultCode");
        String transId = params.get("transId");

        try {
            Payment payment = paymentService.findByBookingCode(orderId);
            if (payment == null) {
                return MomoIpnResponseConst.ORDER_NOT_FOUND;
            }
            long amountFromMomo = Long.parseLong(params.get("amount"));
            if (payment.getAmount().longValue() != amountFromMomo) {
                return MomoIpnResponseConst.AMOUNT_MISMATCH;
            }
            if (!payment.getStatus().equals(PaymentStatus.PENDING)) {
                return MomoIpnResponseConst.SUCCESS; // Trả về thành công để MoMo dừng gọi lại
            }
            boolean isSuccess = "00".equals(resultCode);
            paymentService.updatePaymentResult(payment, transId, params.toString(), isSuccess);
            if (isSuccess) {
                emailService.sendConfirmationEmail(payment.getBooking());
            }
            return MomoIpnResponseConst.SUCCESS;

        } catch (Exception e) {
            return MomoIpnResponseConst.UNKNOWN_ERROR;
        }
    }
}
