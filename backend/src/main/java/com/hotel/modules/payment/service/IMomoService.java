package com.hotel.modules.payment.service;

import java.util.Map;

import com.hotel.modules.payment.dto.request.MoMoRequest;
import com.hotel.modules.payment.dto.response.MomoResponse;

public interface IMomoService {
    public MomoResponse createQR(MoMoRequest request);
    public boolean verifyIpn(Map<String, String> params);
}
