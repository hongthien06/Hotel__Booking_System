package com.hotel.modules.payment.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hotel.common.utils.RequestUtil;
import com.hotel.modules.payment.dto.request.PaymentRequest;
import com.hotel.modules.payment.dto.response.IpnResponse;
import com.hotel.modules.payment.dto.response.PaymentCreateResponse;
import com.hotel.modules.payment.service.IPaymentService;
import com.hotel.modules.payment.service.IpnHandler;

import org.springframework.web.bind.annotation.RequestBody;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequestMapping("/payments")
public class PaymentController {

    private final IpnHandler momoIpnHandler;
    private final IpnHandler vnpayIpnHandler;
    private final IPaymentService paymentService;

    public PaymentController(
            @Qualifier("momoIpnHandler") IpnHandler momoHandler,
            @Qualifier("vnpayIpnHandler") IpnHandler vnpayHandler,
            IPaymentService paymentService) {
        this.momoIpnHandler = momoHandler;
        this.vnpayIpnHandler = vnpayHandler;
        this.paymentService = paymentService;
    }

    @PostMapping("/create")
    public PaymentCreateResponse createPayment(HttpServletRequest request, @RequestBody PaymentRequest paymentRequest) {
        String ipAdress = "127.0.0.1";
        return paymentService.createInitialPayment(paymentRequest, ipAdress);
    }

    @GetMapping("/vnpay_ipn")
    public IpnResponse processVNPayIpn(@RequestParam Map<String, String> params) {
        return vnpayIpnHandler.process(params);
    }

    @PostMapping("/momo_ipn")
    public IpnResponse processMomoIpn(@RequestBody Map<String, String> params) {
        return momoIpnHandler.process(params);
    }
}
