package com.hotel.modules.payment.service;

import com.hotel.modules.email.dto.EmailRequest;import com.hotel.modules.email.service.EmailService;import com.hotel.modules.payment.constant.VNPayParams;
import com.hotel.modules.payment.constant.VnpIpnResponseConst;
import com.hotel.modules.payment.dto.response.IpnResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service("vnpayIpnHandler")
@RequiredArgsConstructor
public class VNPayIpnHandler implements  IpnHandler {
    private final VNPayService vnPayService;
    private final EmailService emailService;

    @Override
    public IpnResponse process(Map<String, String> params){
        if(!vnPayService.verifyIpn(params)){
            return VnpIpnResponseConst.SIGNATURE_FAILED;
        }
        IpnResponse ipnResponse;
        String txnRef=  params.get(VNPayParams.TXN_REF);
        try{
//            xử lý booking thanh cong
//            Long BookingId = Long.parseLong(txnRef);
//            bookingService.markBooked(bookingId);
            //test send email khi thanh toan thanh cong
            EmailRequest request = EmailRequest.builder()
                    .toEmail("nguyenann1204@gmail.com")
                    .buildingName("Hotel ABC")
                    .buildingAdress("123 Nguyen Trai, HCM")
                    .customerName("Nguyen Van A")
                    .customerPhone("0901234567")
                    .codeBooking("BK20260415")
                    .dateBooking("2026-04-15")
                    .dateCheckin("2026-04-20")
                    .timeCheckin("14:00")
                    .dateCheckout("2026-04-22")
                    .timeCheckout("12:00")
                    .night(2)
                    .people(2)
                    .priceBooking(800000L)
                    .priceBreakfast(120000L)
                    .feeService(50000L)
                    .tax(80000L)
                    .totalPrice(1050000L)
                    .build();
            try {
                emailService.sendMailWithThymeleaf(request.getToEmail(), "Xác nhận thanh toán đặt phòng thành công", request);
            } catch (Exception e) {
                // Chỉ log lỗi gửi mail, KHÔNG return error cho VNPay
                log.error("Lỗi gửi email xác nhận cho booking {}: {}", e.getMessage());
            }

            return VnpIpnResponseConst.SUCCESS;
        }
//        catch (Exception e){
//            kh co don boong king do
//        }
        catch (Exception e){
            ipnResponse = VnpIpnResponseConst.UNKNOWN_ERROR;
        }
        return ipnResponse;
    }
}
