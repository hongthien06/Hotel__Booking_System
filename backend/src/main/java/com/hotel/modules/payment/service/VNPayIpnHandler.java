package com.hotel.modules.payment.service;

import java.math.BigDecimal;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.hotel.modules.email.service.EmailService;
import com.hotel.modules.payment.constant.VNPayParams;
import com.hotel.modules.payment.constant.VnpIpnResponseConst;
import com.hotel.modules.payment.dto.response.IpnResponse;
import com.hotel.modules.payment.entity.Payment;
import com.hotel.modules.payment.entity.PaymentStatus;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("vnpayIpnHandler")
@RequiredArgsConstructor
public class VNPayIpnHandler implements IpnHandler {
    private final VNPayService vnPayService;
    private final EmailService emailService;
    private final PaymentService paymentService;

    @Override
    @Transactional
    public IpnResponse process(Map<String, String> params) {
        if (!vnPayService.verifyIpn(params)) {
            return VnpIpnResponseConst.SIGNATURE_FAILED;
        }
        IpnResponse ipnResponse;
        String txnRef = params.get(VNPayParams.TXN_REF);// bookingCode
        String vnpAmount = params.get(VNPayParams.AMOUNT);
        String responseCode = params.get("vnp_ResponseCode");
        String transactionNo = params.get("vnp_TransactionNo");
        try {
            Payment payment = paymentService.findByBookingCode(txnRef);
            if (payment == null) {
                return VnpIpnResponseConst.ORDER_NOT_FOUND;
            }
            BigDecimal amountFromVNPay = new BigDecimal(vnpAmount)
                    .divide(new BigDecimal(100))
                    .stripTrailingZeros();

            BigDecimal dbAmount = payment.getAmount().stripTrailingZeros();
            log.info("vnpAmount raw: " + vnpAmount);
            log.info("after /100: " + amountFromVNPay);
            log.info("DB amount: " + dbAmount);
            if (dbAmount.compareTo(amountFromVNPay) != 0) {
                return VnpIpnResponseConst.INVALID_AMOUNT;
            }
            if (!payment.getStatus().equals(PaymentStatus.PENDING)) {
                return VnpIpnResponseConst.SUCCESS;
            }
            boolean isSuccess = "00".equals(responseCode);

            paymentService.updatePaymentResult(payment, transactionNo, params.toString(), isSuccess);
            if (isSuccess) {
                emailService.sendConfirmationEmail(payment.getBooking());
            }
            return VnpIpnResponseConst.SUCCESS;
        } catch (Exception e) {
            log.error("IPN processing error", e);
            ipnResponse = VnpIpnResponseConst.UNKNOWN_ERROR;
        }
        return ipnResponse;
    }
}
