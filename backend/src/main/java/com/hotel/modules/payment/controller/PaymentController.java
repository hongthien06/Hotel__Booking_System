package com.hotel.modules.payment.controller;

import com.hotel.modules.payment.dto.request.MoMoRequest;
import com.hotel.modules.payment.dto.request.VNPayRequest;
import com.hotel.modules.payment.dto.response.IpnResponse;
import com.hotel.modules.payment.dto.response.MomoResponse;
import com.hotel.modules.payment.dto.response.VNPayResponse;
import com.hotel.modules.payment.service.IMomoService;
import com.hotel.modules.payment.service.IpnHandler;
import com.hotel.modules.payment.service.IVNPayService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@Slf4j
@RequestMapping("/payments")
public class PaymentController {

    private final IpnHandler momoIpnHandler;
    private final IpnHandler vnpayIpnHandler;
    private final IVNPayService vnpayService;
    private final IMomoService momoService;

    public PaymentController(
            @Qualifier("momoIpnHandler") IpnHandler momoHandler,
            @Qualifier("vnpayIpnHandler") IpnHandler vnpayHandler, IVNPayService vnpayService,
            IMomoService momoService) {
        this.momoIpnHandler = momoHandler;
        this.vnpayIpnHandler = vnpayHandler;
        this.vnpayService = vnpayService;
        this.momoService = momoService;
    }

    @GetMapping("/vnpay_ipn")
    IpnResponse processVNPayIpn(@RequestParam Map<String, String> params) {
        return vnpayIpnHandler.process(params);
    }

    @PostMapping("/vnpay_url")
    VNPayResponse createVNPayUrl(@RequestBody VNPayRequest request) {
        return vnpayService.init(request);
    }

    @PostMapping("/momo/create")
    MomoResponse createMomoQR(@RequestBody MoMoRequest request) {
        return momoService.createQR(request);
    }

    @GetMapping("/momo_ipn")
    IpnResponse processMomoIpn(@RequestParam Map<String, String> params) {
        return momoIpnHandler.process(params);
    }
}
